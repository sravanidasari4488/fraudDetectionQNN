import supabase from "../db/supabaseClient.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Returns server time in IST (Asia/Kolkata)
export const getServerTime = async (_req, res) => {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  return res.status(200).json(new ApiResponse(200, {
    isoUtc: now.toISOString(),
    isoIst: istTime.toISOString().replace('Z', '+05:30'),
    epochMs: now.getTime(),
    timezone: "Asia/Kolkata (IST)",
    offset: "+05:30"
  }));
};

// Generate base slots (09:00 to 18:00 every hour) as used by frontend UI
function generateBaseSlots() {
  return [
    { id: 1, time: '09:00 AM', label: 'Morning' },
    { id: 2, time: '10:00 AM', label: 'Morning' },
    { id: 3, time: '11:00 AM', label: 'Morning' },
    { id: 4, time: '12:00 PM', label: 'Afternoon' },
    { id: 5, time: '01:00 PM', label: 'Afternoon' },
    { id: 6, time: '02:00 PM', label: 'Afternoon' },
    { id: 7, time: '03:00 PM', label: 'Afternoon' },
    { id: 8, time: '04:00 PM', label: 'Evening' },
    { id: 9, time: '05:00 PM', label: 'Evening' },
    { id: 10, time: '06:00 PM', label: 'Evening' },
  ];
}

function parseSlotTimeOnDate(dateStr, slotTimeStr) {
  // dateStr: YYYY-MM-DD; slotTimeStr: e.g., '04:00 PM'
  // Parse as local time to match how bookings are stored
  const [timeStr, period] = slotTimeStr.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);
  let hh = hours;
  if (period === 'PM' && hours !== 12) hh += 12;
  if (period === 'AM' && hours === 12) hh = 0;

  // Create date in local timezone (matches booking storage format)
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(hh, minutes, 0, 0);
  return date;
}

export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // expected format YYYY-MM-DD
    if (!date) throw new ApiError(400, "Missing required query param: date (YYYY-MM-DD)");

    // IST (Asia/Kolkata) is UTC+5:30
    // All times are handled in IST to match user expectations
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const sixHoursFromNowIST = new Date(istNow.getTime() + 6 * 60 * 60 * 1000);

    // Fetch already booked time_slots for the given date
    // Bookings are stored in local format (YYYY-MM-DD HH:mm:ss) without timezone
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const { data: booked, error } = await supabase
      .schema('onlyclick')
      .from('bookings')
      .select('time_slot')
      .gte('time_slot', dayStart)
      .lte('time_slot', dayEnd);

    if (error) throw new ApiError(500, error.message, error);

    const bookedSet = new Set((booked || []).map(b => b.time_slot));

    const slots = generateBaseSlots().map(slot => {
      const slotDate = parseSlotTimeOnDate(date, slot.time);
      // Format to match booking storage format: YYYY-MM-DDTHH:mm:ss (no timezone)
      const slotIsoNoTZ = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}T${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}:${String(slotDate.getSeconds()).padStart(2, '0')}`;

      // For slot availability check, compare against IST times
      // slotDate is in local time, we need to convert to IST equivalent for comparison
      const slotTimeIST = new Date(slotDate.getTime() + istOffset);
      const isAfterCutoff = slotTimeIST.getTime() >= sixHoursFromNowIST.getTime();
      const isBooked = bookedSet.has(slotIsoNoTZ);

      return {
        ...slot,
        available: isAfterCutoff && !isBooked,
        iso: slotIsoNoTZ,
        // Add debug info
        _debug: {
          slotTimeIST: slotTimeIST.toISOString(),
          cutoffTimeIST: sixHoursFromNowIST.toISOString(),
          isBooked,
          isAfterCutoff
        }
      };
    });

    return res.status(200).json(new ApiResponse(200, {
      date,
      serverNowIST: istNow.toISOString(),
      timezone: 'Asia/Kolkata (IST)',
      slots
    }));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json(new ApiError(status, err.message, err));
  }
};
