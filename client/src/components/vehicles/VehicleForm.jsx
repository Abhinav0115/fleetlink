import { useState } from "react";
import { vehicleAPI } from "../../services/api";
import { toast } from "react-toastify";
import { X, Truck, AlertCircle, Package, Circle } from "lucide-react";

const VehicleForm = ({ onVehicleAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        capacityKg: "",
        tyres: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };

        switch (name) {
            case "name":
                if (!value.trim()) {
                    errors.name = "Vehicle name is required";
                } else if (value.length < 2) {
                    errors.name = "Vehicle name must be at least 2 characters";
                } else {
                    delete errors.name;
                }
                break;
            case "capacityKg":
                const capacity = parseInt(value);
                if (!value || isNaN(capacity)) {
                    errors.capacityKg = "Capacity is required";
                } else if (capacity < 1) {
                    errors.capacityKg = "Capacity must be at least 1 kg";
                } else if (capacity > 50000) {
                    errors.capacityKg = "Capacity cannot exceed 50,000 kg";
                } else {
                    delete errors.capacityKg;
                }
                break;
            case "tyres":
                const tyres = parseInt(value);
                if (!value || isNaN(tyres)) {
                    errors.tyres = "Number of tyres is required";
                } else if (tyres < 2) {
                    errors.tyres = "Vehicle must have at least 2 tyres";
                } else if (tyres > 32) {
                    errors.tyres = "Number of tyres cannot exceed 32";
                } else {
                    delete errors.tyres;
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

        // Validate all fields before submission
        const isNameValid = validateField("name", formData.name);
        const isCapacityValid = validateField(
            "capacityKg",
            formData.capacityKg
        );
        const isTyresValid = validateField("tyres", formData.tyres);

        if (!isNameValid || !isCapacityValid || !isTyresValid) {
            setError(
                "Please complete all required fields with valid information."
            );
            toast.error("Please fix the highlighted errors before submitting.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Convert numeric fields
            const payload = {
                ...formData,
                capacityKg: parseInt(formData.capacityKg),
                tyres: parseInt(formData.tyres),
            };

            const response = await vehicleAPI.create(payload);

            // Reset form
            setFormData({ name: "", capacityKg: "", tyres: "" });
            setFieldErrors({});

            // Notify parent component
            if (onVehicleAdded) {
                onVehicleAdded(response.data);
            }
        } catch (err) {
            let errorMessage = "Failed to create vehicle";

            // Handle specific error cases
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 400) {
                errorMessage = "Invalid vehicle data. Please check all fields.";
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
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add New Vehicle
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6" noValidate>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Unable to Create Vehicle
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
                        <div>
                            <label
                                htmlFor="name"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <Truck className="h-4 w-4 text-gray-500" />
                                Vehicle Name
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Truck XL, Van Medium, Bike Express"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    fieldErrors.name
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                }`}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="capacityKg"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <Package className="h-4 w-4 text-gray-500" />
                                Capacity (kg)
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            <input
                                type="number"
                                id="capacityKg"
                                name="capacityKg"
                                value={formData.capacityKg}
                                onChange={handleChange}
                                min="1"
                                max="50000"
                                placeholder="e.g., 1000, 5000, 15000"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    fieldErrors.capacityKg
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                }`}
                            />
                            {fieldErrors.capacityKg && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.capacityKg}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="tyres"
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                            >
                                <Circle className="h-4 w-4 text-gray-500" />
                                Number of Tyres
                                <span className="text-red-500 text-sm">*</span>
                            </label>
                            <input
                                type="number"
                                id="tyres"
                                name="tyres"
                                value={formData.tyres}
                                onChange={handleChange}
                                min="2"
                                max="32"
                                placeholder="e.g., 2, 4, 6, 8, 18"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    fieldErrors.tyres
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                }`}
                            />
                            {fieldErrors.tyres && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.tyres}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                Object.keys(fieldErrors).length > 0 ||
                                !formData.name.trim() ||
                                !formData.capacityKg ||
                                !formData.tyres
                            }
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding Vehicle..." : "Add Vehicle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;
