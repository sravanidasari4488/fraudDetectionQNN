import supabase from "../db/supabaseClient.js";

async function checkTMstatus(req, res, next) {
    try {
        // Add retry logic for network issues
        let retryCount = 0;
        const maxRetries = 3;
        let lastError;

        while (retryCount < maxRetries) {
            try {
                const { data, error } = await supabase
                    .schema('onlyclick')
                    .from('taskmaster')
                    .select('verification_status, blocked_status, name, tm_profilepic, ph_no')
                    .eq('tm_id', req.user.id)
                    .single();

                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!data) {
                    return res.status(404).json({ message: 'Taskmaster not found' });
                }

                console.log('Taskmaster data:', data);

                const { verification_status, blocked_status } = data;

                if (blocked_status === true) {
                    return res.status(403).json({ message: 'Account is blocked' });
                }

                if (verification_status !== true) {  
                    return res.status(403).json({ message: 'Account not verified' });
                }
                
                req.user.tm_profilepic = data.tm_profilepic;
                req.user.name = data.name;
                req.user.ph_no = data.ph_no;

                return next();

            } catch (networkError) {
                lastError = networkError;
                retryCount++;
                
                if (networkError.message?.includes('fetch failed') || 
                    networkError.message?.includes('TypeError: fetch failed') ||
                    networkError.code === 'ECONNRESET' || 
                    networkError.code === 'ENOTFOUND' ||
                    networkError.code === 'ETIMEDOUT') {
                    
                    console.log(`Network error in checkTMstatus, retry ${retryCount}/${maxRetries}:`, networkError.message);
                    
                    if (retryCount < maxRetries) {
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                        continue;
                    }
                }
                throw networkError;
            }
        }

        // If all retries failed
        console.error('CheckTMstatus failed after retries:', lastError);
        return res.status(503).json({ 
            message: 'Service temporarily unavailable. Please try again.' 
        });

    } catch (err) {
        console.error('Unexpected error in checkTMstatus:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default checkTMstatus;