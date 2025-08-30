import { format } from "date-fns";
import {
    MapPin,
    Clock,
    User,
    Trash2,
    Truck,
} from "lucide-react";

const BookingCard = ({ booking, onDelete, isUpcoming }) => {
    const formatDateTime = (dateString) => {
        return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    };

    const getEndTime = (startTime, duration) => {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
        return format(end, "MMM dd, yyyy HH:mm");
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Truck className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {booking.vehicleId?.name ||
                                        "Vehicle Not Found"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Booking ID:{" "}
                                    {booking._id.slice(-6)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    isUpcoming(booking.startTime)
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                                {isUpcoming(booking.startTime)
                                    ? "Upcoming"
                                    : "Active"}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">
                                    Route
                                </p>
                                <p className="text-sm font-medium">
                                    {booking.fromPincode} →{" "}
                                    {booking.toPincode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">
                                    Start Time
                                </p>
                                <p className="text-sm font-medium">
                                    {formatDateTime(booking.startTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <User className="h-4 w-4 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">
                                    Customer
                                </p>
                                <p className="text-sm font-medium">
                                    {booking.customerId}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">
                                    Duration
                                </p>
                                <p className="text-sm font-medium">
                                    {booking.estimatedRideDurationHours}h
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* End Time Info */}
                    {booking.estimatedRideDurationHours && (
                        <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                            Expected completion:{" "}
                            {getEndTime(
                                booking.startTime,
                                booking.estimatedRideDurationHours
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="ml-4">
                    <button
                        onClick={() => onDelete(booking)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete booking"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingCard;
