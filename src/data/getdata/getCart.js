import supabase from "../supabaseClient";

export default async function fetchCart(couponApplied = false, appliedCouponCode = null) {
    
    // 1) Get coupon details for prebooking, online discount, and commission
    const getDiscountAndCommission = async () => {
        const { data, error } = await supabase
            .schema('onlyclick')
            .from('general_data')
            .select('key, value');
        console.log('[getCart] Raw data from general_data:', data);
        if (error) {
            console.error("[getCart] Error fetching general_data:", error);
            return {};
        }


        // Convert [{key, value}, ...] → {key: value, ...}
        const result = data.reduce((acc, { key, value }) => {
            // Parse as float for numeric values, keep as string for text values like coupon codes and dates
            if (key.endsWith('_COUPON') || key.endsWith('_DATE') || key === 'server_link') {
                acc[key] = value; // Keep coupon codes, dates, and URLs as string
            } else {
                acc[key] = parseFloat(value); // Parse numeric values as float
            }
            return acc;
        }, {});

        console.log('[getCart] Processed systemConfig:', result);
        return result;
    };

    // Fetch system configuration
    const systemConfig = await getDiscountAndCommission();
    const COMMISSION_PERCENT = systemConfig.commission_percent;
    const ONLINE_PAYMENT_DISCOUNT_PERCENT = systemConfig.online_payment_discount_percent;
    const CONVENIENCE_FEE_PERCENT = systemConfig.CONVENIENCE_FEE_PERCENT;

    // Extract all available coupons and their discount percentages
    const availableCoupons = {};
    Object.keys(systemConfig).forEach(key => {
        if (key.endsWith('_COUPON')) {
            const couponCode = systemConfig[key];
            const couponPrefix = key.replace('_COUPON', '');
            const discountKey = `${couponPrefix}_DISCOUNT_PERCENT`;
            const discountPercent = systemConfig[discountKey];
            
            if (couponCode && discountPercent) {
                availableCoupons[couponCode] = {
                    code: couponCode,
                    discountPercent: discountPercent,
                    couponKey: key,
                    discountKey: discountKey
                };
            }
        }
    });

    console.log('[getCart] Available coupons:', availableCoupons);
    console.log('[getCart] Coupon applied?', couponApplied, 'Applied coupon code:', appliedCouponCode);

    // Determine which discount to apply
    let activeCouponDiscount = 0;
    let activeCouponInfo = null;
    
    if (couponApplied && appliedCouponCode && availableCoupons[appliedCouponCode]) {
        activeCouponInfo = availableCoupons[appliedCouponCode];
        activeCouponDiscount = activeCouponInfo.discountPercent;
        console.log('[getCart] Active coupon:', activeCouponInfo);
    } else if (couponApplied && appliedCouponCode) {
        console.warn('[getCart] Coupon code not found in available coupons:', appliedCouponCode);
    }



    // 2) Get cart data for current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
        console.warn("[getCart] No authenticated user; returning empty cart");
        return { arr: [], error: null };
    }

    const { data, error } = await supabase
        .schema("onlyclick")
        .from("users")
        .select("cart")
        .eq("user_id", userId)
        .single();


    if (error) {
        console.error("Error fetching cart:", error);
        // Handle 0 rows for .single() gracefully
        if (error.code === 'PGRST116') {
            return { arr: [], error: null };
        }
        return { arr: [], error };
    }

    if (!data || !data.cart || !data.cart.items) {
        return { arr: [], error: null };
    }


    // Extract service IDs from cart
    const serviceIds = data.cart.items.map(item => item.service_id);

    // Fetch current service data from services table to get latest prices
    const { data: service_data, error: service_error } = await supabase
        .schema("onlyclick")
        .from("services")
        .select("service_id, price")
        .in('service_id', serviceIds);

    if (service_error) {
        console.error("Error fetching service data:", service_error);
        return { arr: [], error: service_error };
    }

    // Create a map for quick lookup of current service prices
    const serviceDataMap = {};
    service_data.forEach(service => {
        serviceDataMap[service.service_id] = service;
    });

    // 3) Process cart items with new pricing system
    const processedCartItems = data.cart.items.map(cartItem => {
        const qty = cartItem.count_in_cart || 0;
        if (qty === 0) return cartItem; // Skip items with zero quantity

        // Get latest price from backend or fallback to cart price
        const originalPrice = serviceDataMap[cartItem.service_id]?.price || cartItem.price;
        
        // 4) Apply coupon discount if coupon is applied
        let servicePrice = originalPrice;
        let couponDiscountAmount = 0;
        
        if (couponApplied && activeCouponDiscount > 0) {
            couponDiscountAmount = (originalPrice * activeCouponDiscount / 100);
            servicePrice = originalPrice - couponDiscountAmount;
            console.log(`[getCart] Item ${cartItem.service_id}: Original ₹${originalPrice}, Discount ${activeCouponDiscount}%, Final ₹${servicePrice}`);
        }

        // 5) Calculate TM share: (100-commission)% of the service price
        const tmShare = (servicePrice * (100 - COMMISSION_PERCENT) / 100);

        // 6) Add convenience charge + platform fees for each service
        const convenienceFee = (servicePrice * CONVENIENCE_FEE_PERCENT / 100);
        const totalItemPrice = servicePrice + convenienceFee;

        // 7) Calculate online payment discount (on service price before convenience fee)
        const onlineDiscountAmount = (servicePrice * ONLINE_PAYMENT_DISCOUNT_PERCENT / 100);

        // 8) Company share calculation
        let companyShare;
        if (couponApplied) {
            // Company gets: convenience fee + commission% of discounted service price
            companyShare = convenienceFee + (servicePrice * COMMISSION_PERCENT / 100);
        } else {
            // Company gets: convenience fee + commission% of full service price
            companyShare = convenienceFee + (servicePrice * COMMISSION_PERCENT / 100);
        }

        return {
            ...cartItem,
            original_price: originalPrice,
            service_price: parseFloat(servicePrice.toFixed(2)), // Service price after coupon discount
            convenience_fee: parseFloat(convenienceFee.toFixed(2)),
            total_price: parseFloat(totalItemPrice.toFixed(2)), // Service price + convenience fee
            tm_share: parseFloat(tmShare.toFixed(2)),
            company_share: parseFloat(companyShare.toFixed(2)),
            online_discount_amount: parseFloat(onlineDiscountAmount.toFixed(2)),
            coupon_discount_amount: parseFloat(couponDiscountAmount.toFixed(2)),
            coupon_discount_applied: couponApplied,
            coupon_discount_percent: couponApplied ? activeCouponDiscount : 0,
            applied_coupon_code: couponApplied ? appliedCouponCode : null
        };
    });

    // Calculate totals
    let subTotal = 0; // Sum of all service prices (after coupon discount)
    let totalConvenienceFee = 0;
    let totalTMShare = 0;
    let totalCompanyShare = 0;
    let totalOnlineDiscount = 0;
    let totalCouponDiscount = 0;

    processedCartItems.forEach(item => {
        const qty = item.count_in_cart || 0;
        if (qty > 0) {
            subTotal += (item.service_price * qty);
            totalConvenienceFee += (item.convenience_fee * qty);
            totalTMShare += (item.tm_share * qty);
            totalCompanyShare += (item.company_share * qty);
            totalOnlineDiscount += (item.online_discount_amount * qty);
            totalCouponDiscount += (item.coupon_discount_amount * qty);
        }
    });

    const grandTotal = subTotal + totalConvenienceFee; // Total before any payment discounts

    // Calculate final amounts based on payment method
    const totalWithOnlineDiscount = grandTotal - totalOnlineDiscount;

    console.log('[getCart] Totals:', {
        subTotal,
        totalConvenienceFee,
        grandTotal,
        totalCouponDiscount,
        totalOnlineDiscount,
        totalWithOnlineDiscount
    });

    // Transform data for UI display (grouped by category)
    function transformCartData(items) {
        if (!items || items.length === 0) return [];

        const grouped = {};

        items.forEach((item) => {
            const category = item.category || "Uncategorized";

            if (!grouped[category]) {
                grouped[category] = {
                    category,
                    items: []
                };
            }

            grouped[category].items.push({
                id: item.id,
                name: item.title || "Unnamed Service",
                price: item.service_price, // Use discounted service price
                quantity: item.count_in_cart || 0,
                duration: item.duration || "N/A",
                service_id: item.service_id
            });
        });

        return Object.values(grouped);
    }

    const arr = transformCartData(processedCartItems);

    const returnData = {
        arr,
        subTotal: parseFloat(subTotal.toFixed(2)),
        convenienceFee: parseFloat(totalConvenienceFee.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        totalTMShare: parseFloat(totalTMShare.toFixed(2)),
        totalCompanyShare: parseFloat(totalCompanyShare.toFixed(2)),
        onlinePaymentDiscount: parseFloat(totalOnlineDiscount.toFixed(2)),
        onlineDiscountPercent: ONLINE_PAYMENT_DISCOUNT_PERCENT,
        couponDiscount: parseFloat(totalCouponDiscount.toFixed(2)),
        couponDiscountPercent: activeCouponDiscount,
        isCouponApplied: couponApplied,
        appliedCouponCode: appliedCouponCode,
        totalWithOnlineDiscount: parseFloat(totalWithOnlineDiscount.toFixed(2)),
        rawCartData: processedCartItems,
        error: null,
        // System configuration for reference
        systemConfig: {
            COMMISSION_PERCENT,
            ONLINE_PAYMENT_DISCOUNT_PERCENT,
            CONVENIENCE_FEE_PERCENT,
            ...systemConfig // Include all system config
        },
        availableCoupons: Object.values(availableCoupons) // Return available coupons for UI
    };

    console.log('[getCart] Final return data:', returnData);
    return returnData;
}
