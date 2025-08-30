# FleetLink Frontend

A modern React-based fleet management system frontend built with Vite, Tailwind CSS, and Lucide React icons.

## 🚀 Features

### 🚛 Vehicle Management

-   Add new vehicles with capacity and specifications
-   View all vehicles in a responsive grid layout
-   Search and filter vehicles by name and capacity
-   Delete vehicles with confirmation modal
-   Real-time vehicle availability checking

### 📅 Booking System

-   Create bookings with automatic conflict detection
-   Real-time availability checking based on routes and time
-   Automatic ride duration calculation using pincode difference
-   Visual booking status tracking (Upcoming → Active → Completed)
-   Delete and manage existing bookings with detailed confirmation

### 🎨 Modern UI/UX

-   Beautiful, responsive design with Tailwind CSS 4
-   Interactive loading states and error boundaries
-   Real-time data updates with auto-refresh
-   Mobile-first responsive interface
-   Toast notifications for user feedback
-   Hover effects and smooth transitions

### 🔧 Technical Features

-   Built with React 19 and Vite 7
-   Environment-based API configuration
-   Axios for API communication with interceptors
-   Feature-based component architecture
-   Debounced API calls for optimal performance
-   Component-based error handling

## 📁 Project Structure

```
src/
├── components/              # Feature-based component organization
│   ├── common/              # Shared components
│   │   ├── DateTimePicker.jsx    # Custom date/time input
│   │   ├── DeleteModal.jsx       # Reusable confirmation modal
│   │   ├── ErrorBoundary.jsx     # Error handling wrapper
│   │   ├── LoadingSpinner.jsx    # Loading state indicator
│   │   └── NotificationContainer.jsx # Toast system
│   ├── vehicles/            # Vehicle feature module
│   │   ├── VehicleCard.jsx       # Individual vehicle display
│   │   ├── VehicleForm.jsx       # Vehicle creation/edit form
│   │   └── VehicleList.jsx       # Vehicle grid + search/filter
│   └── bookings/            # Booking feature module
│       ├── BookingCard.jsx       # Individual booking display
│       ├── BookingForm.jsx       # Booking creation form
│       └── BookingList.jsx       # Booking list + filter/search
├── services/                # API service layer
│   └── api.js              # Axios configuration and API methods
├── App.jsx                 # Main application with dashboard
├── main.jsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## 🛠️ Quick Start

### Prerequisites

-   Node.js 18+
-   Backend server running on port 5000

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure environment:

    ```bash
    # Create .env file with:
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔌 API Integration

The frontend communicates with the FleetLink backend API using environment variables:

-   **Base URL**: Configured via `VITE_API_BASE_URL`
-   **Vehicles API**: `/vehicles` (GET, POST, DELETE), `/vehicles/available` (GET)
-   **Bookings API**: `/bookings` (GET, POST, DELETE)

### Key API Features

#### Smart Availability Checking

-   Debounced API calls (500ms delay) for form inputs
-   Automatic vehicle availability validation
-   Conflict detection for overlapping bookings
-   Estimated ride duration calculation

#### Optimized Performance

-   Request/response interceptors for logging
-   Error handling with user-friendly messages
-   Optimistic UI updates for better UX
-   Environment-based configuration

## 🎯 Key Components

### Interactive Dashboard

-   **Clickable Stats Cards**: Navigate to relevant sections
-   **Real-time Metrics**: Live vehicle and booking counts
-   **Tab Navigation**: Easy switching between features

### Vehicle Management

-   **Smart Cards**: Capacity indicators and delete functionality
-   **Search & Filter**: Real-time filtering by name and capacity
-   **Form Validation**: Comprehensive input validation

### Booking System

-   **Status Tracking**: Auto-refresh every 60 seconds
-   **Date/Time Picker**: Custom datetime input component
-   **Conflict Prevention**: Prevents double-booking scenarios

## 🛡️ Technologies Used

-   **React 19** - Latest UI library with modern hooks
-   **Vite 7** - Lightning-fast build tool and dev server
-   **Tailwind CSS 4** - Utility-first CSS framework
-   **Axios** - HTTP client with interceptors
-   **Lucide React** - Beautiful icon library
-   **React Toastify** - Toast notification system

## 📜 Available Scripts

-   `npm run dev` - Start development server with hot reload
-   `npm run build` - Build optimized production bundle
-   `npm run preview` - Preview production build locally
-   `npm run lint` - Run ESLint for code quality

## 🌐 Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The API service automatically uses this configuration:

```javascript
// Automatically reads from environment
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    timeout: 10000,
});
```

## 🤝 Backend Integration

This frontend is designed to work seamlessly with the FleetLink Node.js backend. Ensure the backend server is running before starting the frontend development server.

## 📝 Development Notes

-   Follow the feature-based component organization
-   Use TypeScript-style JSDoc comments
-   Ensure responsive design for all components
-   Handle loading and error states consistently
-   Test on multiple screen sizes and devices
