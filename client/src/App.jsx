import { useState, useEffect } from "react";
import { vehicleAPI, bookingAPI } from "./services/api";
import VehicleForm from "./components/vehicles/VehicleForm";
import BookingForm from "./components/bookings/BookingForm";
import VehicleList from "./components/vehicles/VehicleList";
import BookingList from "./components/bookings/BookingList";
import { toast } from "react-toastify";
import {
    Truck,
    Calendar,
    Plus,
    RefreshCw,
    Package,
    AlertCircle,
} from "lucide-react";

function App() {
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [activeTab, setActiveTab] = useState("vehicles");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [vehiclesRes, bookingsRes] = await Promise.all([
                vehicleAPI.getAll(),
                bookingAPI.getAll(),
            ]);
            setVehicles(vehiclesRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Failed to load data:", error);
            setError(
                "Failed to load data. Please check if the backend server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleAdded = (newVehicle) => {
        setVehicles((prev) => [...prev, newVehicle]);
        setShowVehicleForm(false);
        toast.success(`Vehicle "${newVehicle.name}" added successfully!`);
    };

    const handleBookingAdded = (newBooking) => {
        setBookings((prev) => [...prev, newBooking]);
        setShowBookingForm(false);
        toast.success("Booking created successfully!");
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            await bookingAPI.delete(bookingId);
            setBookings((prev) =>
                prev.filter((booking) => booking._id !== bookingId)
            );
            toast.success("Booking deleted successfully!");
        } catch (error) {
            console.error("Failed to delete booking:", error);
            toast.error("Failed to delete booking. Please try again.");
        }
    };

    const handleDeleteVehicle = async (vehicleId) => {
        try {
            const response = await vehicleAPI.delete(vehicleId);

            // Remove the vehicle from state
            setVehicles((prev) =>
                prev.filter((vehicle) => vehicle._id !== vehicleId)
            );

            // Remove all bookings associated with this vehicle
            setBookings((prev) =>
                prev.filter((booking) => booking.vehicleId._id !== vehicleId)
            );

            // Show success message with additional info if bookings were deleted
            const deletedBookingsCount =
                response.data.deletedBookingsCount || 0;
            if (deletedBookingsCount > 0) {
                toast.success(
                    `Vehicle deleted successfully! ${deletedBookingsCount} associated booking(s) were also removed.`
                );
            } else {
                toast.success("Vehicle deleted successfully!");
            }
        } catch (error) {
            console.error("Failed to delete vehicle:", error);
            toast.error("Failed to delete vehicle. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                    <div>
                        <p className="text-xl font-semibold text-gray-900">
                            Loading FleetLink
                        </p>
                        <p className="text-gray-600">
                            Please wait while we fetch your data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Connection Error
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <Truck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    FleetLink
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Fleet Management System
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadData}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                title="Refresh data"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setActiveTab("vehicles")}
                        className="bg-white rounded-xl shadow-sm p-6 py-4 border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Vehicles
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {vehicles.length}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Active fleet
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Truck className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("bookings")}
                        className="bg-white rounded-xl shadow-sm p-6 py-4 border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Active Bookings
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {bookings.length}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Current bookings
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Calendar className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </button>

                    <div className="bg-white rounded-xl shadow-sm p-6 py-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Capacity
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {vehicles
                                        .reduce(
                                            (sum, v) => sum + v.capacityKg,
                                            0
                                        )
                                        .toLocaleString()}
                                    kg
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Fleet capacity
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Package className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab("vehicles")}
                                className={`py-4 cursor-pointer px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === "vehicles"
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <Truck className="inline h-4 w-4 mr-2" />
                                Vehicles ({vehicles.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`py-4 px-1 cursor-pointer border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === "bookings"
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <Calendar className="inline h-4 w-4 mr-2" />
                                Bookings ({bookings.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 py-4">
                        {activeTab === "vehicles" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Vehicle Fleet
                                        </h2>
                                        <p className="text-gray-600">
                                            Manage your fleet vehicles
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowVehicleForm(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Vehicle
                                    </button>
                                </div>
                                <VehicleList
                                    vehicles={vehicles}
                                    onDeleteVehicle={handleDeleteVehicle}
                                />
                            </div>
                        )}

                        {activeTab === "bookings" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Bookings
                                        </h2>
                                        <p className="text-gray-600">
                                            Manage vehicle bookings and
                                            schedules
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowBookingForm(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors cursor-pointer"
                                        disabled={vehicles.length === 0}
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Booking
                                    </button>
                                </div>
                                {vehicles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            You need to add vehicles before
                                            creating bookings.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setActiveTab("vehicles");
                                                setShowVehicleForm(true);
                                            }}
                                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                                        >
                                            Add Your First Vehicle
                                        </button>
                                    </div>
                                ) : (
                                    <BookingList
                                        bookings={bookings}
                                        onDeleteBooking={handleDeleteBooking}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showVehicleForm && (
                <VehicleForm
                    onVehicleAdded={handleVehicleAdded}
                    onCancel={() => setShowVehicleForm(false)}
                />
            )}

            {showBookingForm && (
                <BookingForm
                    onBookingAdded={handleBookingAdded}
                    onCancel={() => setShowBookingForm(false)}
                />
            )}
        </div>
    );
}

export default App;
