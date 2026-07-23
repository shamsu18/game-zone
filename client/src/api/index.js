import api from './axios.js';

// ===== Auth =====
export const authApi = {
  signup: (data) => api.post('/auth/signup', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateMe: (data) => api.put('/auth/me', data).then((r) => r.data),
};

// ===== Stations =====
export const stationApi = {
  list: (params) => api.get('/stations', { params }).then((r) => r.data),
  get: (id) => api.get(`/stations/${id}`).then((r) => r.data),
  create: (data) => api.post('/stations', data).then((r) => r.data),
  update: (id, data) => api.put(`/stations/${id}`, data).then((r) => r.data),
  toggleStatus: (id) =>
    api.patch(`/stations/${id}/toggle-status`).then((r) => r.data),
  remove: (id) => api.delete(`/stations/${id}`).then((r) => r.data),
};

// ===== Packages =====
export const packageApi = {
  list: (params) => api.get('/packages', { params }).then((r) => r.data),
  create: (data) => api.post('/packages', data).then((r) => r.data),
  update: (id, data) => api.put(`/packages/${id}`, data).then((r) => r.data),
  toggleActive: (id) =>
    api.patch(`/packages/${id}/toggle-active`).then((r) => r.data),
  remove: (id) => api.delete(`/packages/${id}`).then((r) => r.data),
};

// ===== Tournaments =====
export const tournamentApi = {
  list: (params) => api.get('/tournaments', { params }).then((r) => r.data),
  get: (id) => api.get(`/tournaments/${id}`).then((r) => r.data),
  create: (data) => api.post('/tournaments', data).then((r) => r.data),
  update: (id, data) => api.put(`/tournaments/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/tournaments/${id}`).then((r) => r.data),
  register: (id) => api.post(`/tournaments/${id}/register`).then((r) => r.data),
};

// ===== Bookings =====
export const bookingApi = {
  availability: (station, date) =>
    api.get('/bookings/availability', { params: { station, date } }).then((r) => r.data),
  create: (data) => api.post('/bookings', data).then((r) => r.data),
  createWalkIn: (data) => api.post('/bookings/walk-in', data).then((r) => r.data),
  mine: () => api.get('/bookings/my').then((r) => r.data),
  listAll: (params) => api.get('/bookings', { params }).then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data),
  reschedule: (id, data) =>
    api.patch(`/bookings/${id}/reschedule`, data).then((r) => r.data),
  remove: (id) => api.delete(`/bookings/${id}`).then((r) => r.data),
};

// ===== Settings =====
export const settingsApi = {
  get: () => api.get('/settings').then((r) => r.data),
  update: (data) => api.put('/settings', data).then((r) => r.data),
};

// ===== Users (customers & staff) =====
export const userApi = {
  customers: (params) =>
    api.get('/users/customers', { params }).then((r) => r.data),
  customerBookings: (id) =>
    api.get(`/users/${id}/bookings`).then((r) => r.data),
  toggleBlock: (id) => api.patch(`/users/${id}/block`).then((r) => r.data),
  staff: () => api.get('/users/staff').then((r) => r.data),
  createStaff: (data) => api.post('/users/staff', data).then((r) => r.data),
  updateStaff: (id, data) =>
    api.put(`/users/staff/${id}`, data).then((r) => r.data),
  removeStaff: (id) => api.delete(`/users/staff/${id}`).then((r) => r.data),
};

// ===== Dashboard =====
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  revenue7d: () => api.get('/dashboard/revenue-7d').then((r) => r.data),
};

// ===== Payments =====
export const paymentApi = {
  initiate: (bookingId) =>
    api.post(`/payments/initiate/${bookingId}`).then((r) => r.data),
  confirm: (bookingId) =>
    api.post(`/payments/confirm/${bookingId}`).then((r) => r.data),
  list: (params) => api.get('/payments', { params }).then((r) => r.data),
  markPaid: (bookingId) =>
    api.patch(`/payments/${bookingId}/mark-paid`).then((r) => r.data),
  refund: (bookingId) =>
    api.patch(`/payments/${bookingId}/refund`).then((r) => r.data),
};

// ===== Upload =====
export const uploadApi = {
  image: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api
      .post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
