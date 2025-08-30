import { useState, useEffect } from "react";
import { bookingAPI, vehicleAPI } from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
    X,
    Calendar,
    MapPin,
    User,
    Clock,
    AlertCircle,
    Loader2,
    Car,
} from "lucide-react";
import DateTimePicker from "../common/DateTimePicker";

const BookingForm = ({ onBookingAdded, onCancel }) => {
    // Get default datetime (current time + 1 hour)
    const getDefaultDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0); // Round to the nearest hour
        return format(now, "yyyy-MM-dd'T'HH:mm");
    };

    const [formData, setFormData] = useState({
        vehicleId: "",
        fromPincode: "",
        toPincode: "",
        startTime: getDefaultDateTime(),
        customerId: "",
    });
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [estimatedDuration, setEstimatedDuration] = useState(null);

    useEffect(() => {
        const isFromPincodeValid =
            formData.fromPincode && formData.fromPincode.length === 6;
        const isToPincodeValid =
            formData.toPincode && formData.toPincode.length === 6;

        if (isFromPincodeValid && isToPincodeValid && formData.startTime) {
            const debounceTimer = setTimeout(() => {
                checkAvailability();
            }, 500);

            return () => clearTimeout(debounceTimer);
        } else {
            setAvailableVehicles([]);
            setEstimatedDuration(null);
        }
    }, [formData.fromPincode, formData.toPincode, formData.startTime]);

    const checkAvailability = async () => {
        if (!formData.fromPincode || !formData.toPincode || !formData.startTime)
            return;

        setCheckingAvailability(true);
        try {
            const response = await vehicleAPI.getAvailable({
                capacityRequired: 1, // Minimum capacity for availability check
                fromPincode: formData.fromPincode,
                toPincode: formData.toPincode,
                startTime: formData.startTime,
            });

            setAvailableVehicles(response.data);

            // Calculate estimated duration
            if (response.data.length > 0) {
                const duration = response.data[0].estimatedRideDurationHours;
                setEstimatedDuration(duration);
            }
        } catch (err) {
            console.error("Failed to check availability:", err);
            setAvailableVehicles([]);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };

        switch (name) {
            case "fromPincode":
            case "toPincode":
                const pincodeRegex = /^[0-9]{6}$/;
                if (!value.trim()) {
                    errors[name] = "Pincode is required";
                } else if (!pincodeRegex.test(value)) {
                    errors[name] = "Pincode must be exactly 6 digits";
                } else {
                    delete errors[name];
                }
                break;
            case "customerId":
                if (!value.trim()) {
                    errors.customerId = "Customer ID is required";
                } else if (value.length < 2) {
                    errors.customerId =
                        "Customer ID must be at least 2 characters";
                } else {
                    delete errors.customerId;
                }
                break;
            case "startTime":
                if (!value) {
                    errors.startTime = "Start time is required";
                } else {
                    const selectedTime = new Date(value);
                    const now = new Date();
                    if (selectedTime <= now) {
                        errors.startTime = "Start time must be in the future";
                    } else {
                        delete errors.startTime;
                    }
                }
                break;
            case "vehicleId":
                if (!value) {
                    errors.vehicleId = "Please select a vehicle";
                } else {
                    delete errors.vehicleId;
                }
                break;
            default:
                break;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear general error when user starts typing
        if (error) setError("");

        // Validate field on change
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await bookingAPI.create(formData);

            // Reset form
            setFormData({
                vehicleId: "",
                fromPincode: "",
                toPincode: "",
                startTime: getDefaultDateTime(),
                customerId: "",
            });
            setEstimatedDuration(null);

            // Notify parent component
            if (onBookingAdded) {
                onBookingAdded(response.data);
            }
        } catch (err) {
            let errorMessage = "Failed to create booking";

            // Handle specific error cases
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 400) {
                errorMessage =
                    "Invalid booking data. Please check all fields and try again.";
            } else if (err.response?.status === 409) {
                errorMessage =
                    "Vehicle is not available for the selected time. Please choose a different time or vehicle.";
            } else if (err.response?.status === 404) {
                errorMessage =
                    "Selected vehicle not found. Please refresh and try again.";
            } else if (err.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (err.code === "NETWORK_ERROR" || !err.response) {
                errorMessage =
                    "Network error. Please check your connection and try again.";
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex backdrop-blur-xs items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 w-full max-w-lg max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Create New Booking
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 py-4" noValidate>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Unable to Create Booking
                                    </h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        {error}
                                    </p>
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setError("")}
                                            className="text-xs text-red-600 hover:text-red-800 underline cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Route Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="fromPincode"
                                    className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                                >
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    From Pincode
                                    <span className="text-red-500 text-sm">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="fromPincode"
                                    name="fromPincode"
                                    value={formData.fromPincode}
                                    onChange={handleChange}
                                    maxLength="6"
                                    minLength="6"
                                    pattern="[0-9]{6}"
                                    // required
                                    placeholder="e.g., 110001"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        fieldErrors.fromPincode
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                />
                                {fieldErrors.fromPincode && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.fromPincode}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="toPincode"
                                    className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                                >
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    To Pincode
                                    <span className="text-red-500 text-sm">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="toPincode"
                                    name="toPincode"
                                    value={formData.toPincode}
                                    onChange={handleChange}
                                    // required
                                    placeholder="e.g., 110020"
                                    maxLength="6"
                                    minLength="6"
                                    pattern="[0-9]{6}"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        fieldErrors.toPincode
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                />
                                {fieldErrors.toPincode && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.toPincode}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Start Time */}
                        <div>
                            <label
                                htmlFor="startTime"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <Clock className="h-4 w-4 text-gray-500" />
                                Start Time
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            <DateTimePicker
                                value={
                                    formData.startTime || getDefaultDateTime()
                                }
                                onChange={handleChange}
                                minDate={new Date()}
                                placeholder="Select date and time"
                                error={fieldErrors.startTime}
                            />
                            {fieldErrors.startTime && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.startTime}
                                </p>
                            )}
                        </div>

                        {/* Estimated Duration */}
                        {estimatedDuration && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm text-purple-800">
                                        Estimated ride duration:{" "}
                                        <strong>
                                            {estimatedDuration} hours
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Vehicle Selection */}
                        <div>
                            <label
                                htmlFor="vehicleId"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <Car className="h-4 w-4 text-gray-500" />
                                Select Vehicle
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            {checkingAvailability ? (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                    <span className="text-sm text-gray-600">
                                        Checking availability...
                                    </span>
                                </div>
                            ) : (
                                <select
                                    id="vehicleId"
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        fieldErrors.vehicleId
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        -- Select Vehicle --
                                    </option>
                                    {availableVehicles.map((vehicle) => (
                                        <option
                                            key={vehicle._id}
                                            value={vehicle._id}
                                        >
                                            {vehicle.name} (Capacity:{" "}
                                            {vehicle.capacityKg}kg, Tyres:{" "}
                                            {vehicle.tyres})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {fieldErrors.vehicleId && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.vehicleId}
                                </p>
                            )}

                            {/* Show message when fields are not filled */}
                            {(!formData.fromPincode ||
                                !formData.toPincode ||
                                !formData.startTime) && (
                                <div className="mt-2 p-3 py-1 bg-purple-50 border border-purple-200 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm text-purple-800">
                                            Please fill in the route details and
                                            start time above to see available
                                            vehicles.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Show message when no vehicles available */}
                            {availableVehicles.length === 0 &&
                                !checkingAvailability &&
                                formData.fromPincode &&
                                formData.toPincode &&
                                formData.startTime && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-800">
                                                No vehicles available for the
                                                selected time and route. Please
                                                try a different time or route.
                                            </span>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Customer ID */}
                        <div>
                            <label
                                htmlFor="customerId"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <User className="h-4 w-4 text-gray-500" />
                                Customer ID
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            <input
                                type="text"
                                id="customerId"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                placeholder="e.g., CUST001, john.doe@email.com"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    fieldErrors.customerId
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                }`}
                            />
                            {fieldErrors.customerId && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.customerId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || availableVehicles.length === 0}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50  cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
