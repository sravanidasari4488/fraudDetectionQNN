import api from "./api.js";

export const getServerTime = async () => {
  try {
    const res = await api.get('/api/v1/time/now');
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to fetch server time' };
  }
};

export const getAvailableSlots = async (dateISO) => {
  try {
    const res = await api.get('/api/v1/availability/slots', { params: { date: dateISO } });
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to fetch slots' };
  }
};






