import supabase from "../db/supabaseClient.js";

async function protectedMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    // Add retry logic for network issues
    let retryCount = 0;
    const maxRetries = 3;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        
        if (error) {
          console.error('Auth error:', error);
          return res.status(401).json({ error: "Invalid token" });
        }
        
        req.user = data.user;
        return next();
      } catch (networkError) {
        lastError = networkError;
        retryCount++;
        
        if (networkError.message?.includes('fetch failed') || 
            networkError.code === 'ECONNRESET' || 
            networkError.code === 'ENOTFOUND' ||
            networkError.code === 'ETIMEDOUT') {
          
          console.log(`Network error in auth, retry ${retryCount}/${maxRetries}:`, networkError.message);
          
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
    console.error('Auth failed after retries:', lastError);
    return res.status(503).json({ 
      error: "Service temporarily unavailable. Please try again." 
    });
    
  } catch (error) {
    console.error('Protected middleware error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default protectedMiddleware;
