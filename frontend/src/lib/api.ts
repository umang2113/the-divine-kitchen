const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via IP (mobile), use that IP for backend too
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Menu
export const getMenuItems = async () => {
  try {
    const res = await fetch(`${API_URL}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return await res.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
};

export const checkTableAvailability = async (date: string, time: string) => {
  try {
    const res = await fetch(`${API_URL}/reservations/availability?date=${date}&time=${time}`);
    if (!res.ok) {
      console.error(`Availability Fetch Error: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch availability');
    }
    return await res.json();
  } catch (error) {
    console.error('Error checking availability:', error);
    return [];
  }
};

export const submitReservation = async (reservationData: any) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reservationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit reservation');
    return data;
  } catch (error) {
    console.error('Error submitting reservation:', error);
    throw error;
  }
};

export const getMyReservations = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/reservations/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reservations');
  return data;
};

export const getMyOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data;
};

// Admin
export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error(`Admin Stats Fetch Failed: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch admin stats');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
};

// Admin Menu Management
export const uploadImage = async (file: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
};

export const createMenuItem = async (item: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(item),
  });
  return await res.json();
};

export const updateMenuItem = async (id: string, item: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(item),
  });
  return await res.json();
};

export const deleteMenuItem = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

// Admin Orders
export const getAllOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const updateOrderStatus = async (id: string, status: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status }),
  });
  return await res.json();
};

// Admin Reservations
export const getOrderDetails = async (id: string) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    return await res.json();
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

export const getAllReservations = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const updateReservationStatus = async (id: string, status: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status }),
  });
  return await res.json();
};

// Admin Customers
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

// Auth
export const loginUser = async (credentials: any) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const registerUser = async (userData: any) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

// Public Order Placement
export const placeOrder = async (orderData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(orderData),
  });
  return await res.json();
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return await res.json();
};

export const updateProfile = async (userData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
};

// Delivery API Functions
export const getAvailableOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/delivery/available`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const getMyDeliveryOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/delivery/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const updateDeliveryStatus = async (orderId: string, status: string, otp?: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/delivery/order/${orderId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

export const getDeliveryStats = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/delivery/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const updateLocation = async (locationData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/delivery/location`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(locationData),
  });
  return await res.json();
};

// Settings
export const getSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const updateSettings = async (settings: any) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const initiatePaytmTransaction = async (paymentData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/payment/initiate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(paymentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to initiate Paytm transaction');
  return data;
};
