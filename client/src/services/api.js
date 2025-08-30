import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
    },
    (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(
            "API Response Error:",
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

// Vehicle API methods
export const vehicleAPI = {
    // Create a new vehicle
    create: (vehicleData) => api.post("/vehicles", vehicleData),

    // Get all vehicles
    getAll: () => api.get("/vehicles"),

    // Get vehicle by ID
    getById: (id) => api.get(`/vehicles/${id}`),

    // Delete a vehicle
    delete: (id) => api.delete(`/vehicles/${id}`),

    // Get available vehicles
    getAvailable: (params) => api.get("/vehicles/available", { params }),
};

// Booking API methods
export const bookingAPI = {
    // Create a new booking
    create: (bookingData) => api.post("/bookings", bookingData),

    // Get all bookings
    getAll: () => api.get("/bookings"),

    // Delete a booking
    delete: (id) => api.delete(`/bookings/${id}`),
};

export default api;
