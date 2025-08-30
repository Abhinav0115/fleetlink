import { Truck, Package, Wrench, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteModal from "../common/DeleteModal";

const VehicleCard = ({ vehicle, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const getCapacityColor = (capacity) => {
        if (capacity < 500) return "bg-red-100 text-red-800";
        if (capacity < 1000) return "bg-yellow-100 text-yellow-800";
        return "bg-green-100 text-green-800";
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(vehicle._id);
        setShowDeleteModal(false);
    };

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {vehicle.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            ID: {vehicle._id.slice(-6)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCapacityColor(
                            vehicle.capacityKg
                        )}`}
                    >
                        {vehicle.capacityKg < 500
                            ? "Light"
                            : vehicle.capacityKg < 1000
                            ? "Medium"
                            : "Heavy"}
                    </span>
                    <button
                        onClick={handleDeleteClick}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete vehicle"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Capacity</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        {vehicle.capacityKg}kg
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Tyres</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        {vehicle.tyres}
                    </span>
                </div>
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Vehicle"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong className="font-semibold text-gray-900">
                            {vehicle.name}
                        </strong>
                        ?{" "}
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="text-amber-800 text-sm">
                                <strong>Warning:</strong> This will also delete
                                all bookings associated with this vehicle.
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            This action cannot be undone.
                        </div>
                    </>
                }
            />
        </div>
    );
};

export default VehicleCard;
