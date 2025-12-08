import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://10.148.199.194:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string; role: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: any) => api.post("/auth/register", userData),

  getMe: () => api.get("/auth/me"),

  logout: () => {
    const token = localStorage.getItem("accessToken");

    return api.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post(`/auth/change-password`, data),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get("/users", { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: any) => api.put(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// Patients API
export const patientsAPI = {
  getAll: (params?: any) => api.get("/patients", { params }),

  create: (data: any) => api.post("/patients", data),

  getById: (id: string) => api.get(`/patients/${id}`),

  update: (id: string, data: any) => api.put(`/patients/${id}`, data),

  delete: (id: string) => api.delete(`/patients/${id}`),

  getDietPlans: (id: string, params?: any) =>
    api.get(`/patients/${id}/diet-plans`, { params }),

  getHealthRecords: (id: string, params?: any) =>
    api.get(`/patients/${id}/health-records`, { params }),

  getByDoctor: () => api.get("/patients/doctor/me"),

  getDoctor: () => api.get("/patients/stats/doctor"),

  getPatientCount: () => api.get("/patients/stats/count"),
};

// Foods API
export const foodsAPI = {
  getAll: (params?: any) => api.get("/foods", { params }),

  create: (data: any) => api.post("/foods", data),

  getById: (id: string) => api.get(`/foods/${id}`),

  update: (id: string, data: any) => api.put(`/foods/${id}`, data),

  delete: (id: string) => api.delete(`/foods/${id}`),

  getByCategory: (category: string, params?: any) =>
    api.get(`/foods/category/${category}`, { params }),
};

// Recipes API
export const recipesAPI = {
  getAll: (params?: any) => api.get("/recipes", { params }),

  create: (data: any) => api.post("/recipes", data),

  getById: (id: string) => api.get(`/recipes/${id}`),

  update: (id: string, data: any) => api.put(`/recipes/${id}`, data),

  delete: (id: string) => api.delete(`/recipes/${id}`),
};

// Diet Plans API
export const dietPlansAPI = {
  // Get all diet plans
  getAll: (params?: any) => api.get("/diet-plans", { params }),

  // Create diet plan
  create: (data: any) => api.post("/diet-plans", data),

  // Get diet plans for a patient
  getForPatient: (patientId: string) =>
    api.get(`/diet-plans/patient/${patientId}`),

  // Duplicate a diet plan
  duplicate: (id: string) => api.post(`/diet-plans/${id}/duplicate`),

  // Add an item to a diet plan
  addItem: (id: string, data: any) =>
    api.post(`/diet-plans/${id}/add-item`, data),

  // Update a single item
  updateItem: (itemId: string, data: any) =>
    api.put(`/diet-plans/item/${itemId}`, data),

  // Delete a single item
  deleteItem: (itemId: string) => api.delete(`/diet-plans/item/${itemId}`),

  // Get all items for a plan
  getItems: (id: string) => api.get(`/diet-plans/${id}/items`),

  // Get plan grouped by days
  getByDays: (id: string) => api.get(`/diet-plans/${id}/days`),

  // Get a specific day’s diet
  getByDay: (id: string, dayNumber: number) =>
    api.get(`/diet-plans/${id}/day/${dayNumber}`),

  // Get diet plan details
  getById: (id: string) => api.get(`/diet-plans/${id}`),

  // Update diet plan
  update: (id: string, data: any) => api.put(`/diet-plans/${id}`, data),

  // Soft delete diet plan
  delete: (id: string) => api.delete(`/diet-plans/${id}`),
};



// Chat API
export const chatAPI = {
  getAll: (params?: any) => api.get("/chat", { params }),

  sendMessage: (data: any) => api.post("/chat", data),

  getById: (id: string) => api.get(`/chat/${id}`),

  markAsRead: (id: string) => api.put(`/chat/${id}/read`),

  getConversation: (userId: string, params?: any) =>
    api.get(`/chat/conversation/${userId}`, { params }),

  getChatSummary: (params?: any) => api.get("/chat/summaries", { params }),

  getUnreadSummary: (userId: string, params?: any) =>
    api.get(`/chat/unread/${userId}`, { params }),
};

// Reminders API
export const remindersAPI = {
  getAll: (params?: any) => api.get("/reminders", { params }),

  create: (data: any) => api.post("/reminders", data),

  getById: (id: string) => api.get(`/reminders/${id}`),

  update: (id: string, data: any) => api.put(`/reminders/${id}`, data),

  delete: (id: string) => api.delete(`/reminders/${id}`),

  getByUser: (userId: string, params?: any) =>
    api.get(`/reminders/user/${userId}`, { params }), 
};

// Health Records API
export const healthRecordsAPI = {
  getAll: (params?: any) => api.get("/health-records", { params }),

  create: (data: any) => api.post("/health-records", data),

  getById: (id: string) => api.get(`/health-records/${id}`),

  update: (id: string, data: any) => api.put(`/health-records/${id}`, data),

  delete: (id: string) => api.delete(`/health-records/${id}`),
};

export const diseaseAPI = {
  // GET all diseases (supports pagination)
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/diseases", { params }),

  // CREATE disease (Doctor-only)
  create: (data: {
    name: string;
    vata: number;
    pitta: number;
    kapha: number;
  }) => api.post("/diseases", data),

  // GET disease by ID
  getById: (id: string) => api.get(`/diseases/${id}`),

  // UPDATE disease (Doctor-only)
  update: (
    id: string,
    data: {
      name?: string;
      vata?: number;
      pitta?: number;
      kapha?: number;
    }
  ) => api.put(`/diseases/${id}`, data),

  // DELETE disease
  delete: (id: string) => api.delete(`/diseases/${id}`),
};

export default api;
