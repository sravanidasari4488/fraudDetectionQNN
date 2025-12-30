import supabase from "../supabaseClient";

export default async function getbookings() {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("bookings")
    .select("*");



  if (error) {
    return { arr: [], error };
  }

  if (!data) {
    return { arr: [], error: null };
  }

  const getdateTime = (timestamp) => {
    if (!timestamp) return ["", ""]; // fallback if null

    const [date, timeWithZone] = timestamp.split("T");
    if (!timeWithZone) return [date, ""];

    const time = timeWithZone.split("+")[0];
    return [date, time];
  };

  const formatdata = (element) => {
    const [date, time] = getdateTime(element.time_slot);

    return {
      id: element.id,
      otp: element.otp,
      serviceName: element.service_name,
      date,
      time,
      location: element.location,
      status: element.status,
      provider: element.tm_name,
      priceOfOne: element.service_price,
      price: element.service_price * element.count,
      count: element.count, // ✅ Add count field
      service_price: element.service_price, // ✅ Add service_price field  
      payment_amount: element.payment_amount, // ✅ Add payment_amount field
      tm_share: element.tm_share, // ✅ Add tm_share field
      category: element.category,
      bookingTime: date,
      contact: `+91 ${element.tm_contact}`,
      description: element.service_description || element.service_name, // Use description if available
      estimatedDuration: element.estimated_duration || '1-2 hours',
      paymentMethod: element.payment_method ,
      bookingId: `BK${element.id.toString().padStart(10, '0')}`,
      razorpay_oid: element.razorpay_oid ,
      serviceNotes: element.service_notes || 'Our technician will call 15 minutes before arrival.',
      taskMaster: {
        name: element.tm_name,
        contact: `+91 ${element.tm_contact}`,
        photo: element.tm_photo || 'https://via.placeholder.com/150'
      },
      // Keep the original field names for backward compatibility
      service_name: element.service_name,
      Contact: `+91 ${element.tm_contact}`,
      cart_uuid: element.cart_uuid
    };
  };

  const arr = data.map(formatdata);
  return { arr, error: null };
}
