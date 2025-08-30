import { useState, useEffect } from "react";
import { Calendar, Search, Filter } from "lucide-react";
import BookingCard from "./BookingCard";
import DeleteModal from "../common/DeleteModal";

const BookingList = ({ bookings, onDeleteBooking }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute to refresh booking status
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every 60 seconds

        return () => clearInterval(timer);
    }, []);

    const isUpcoming = (startTime) => {
        return new Date(startTime) > currentTime;
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.customerId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            booking.vehicleId?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            booking.fromPincode.includes(searchTerm) ||
            booking.toPincode.includes(searchTerm);

        // Filter by status based on start time
        const bookingIsUpcoming = isUpcoming(booking.startTime);
        let matchesStatus = true;

        if (filterStatus === "upcoming") {
            matchesStatus = bookingIsUpcoming;
        } else if (filterStatus === "active") {
            matchesStatus = !bookingIsUpcoming;
        }
        // If filterStatus is empty, show all bookings (matchesStatus remains true)

        return matchesSearch && matchesStatus;
    });

    const handleDeleteClick = (booking) => {
        setShowDeleteModal(true);
        setBookingToDelete(booking);
    };

    return (
        <div>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bookings by customer, vehicle, or pincode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    >
                        <option value="">All Bookings</option>
                        <option value="active">Active</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>
            </div>

            {/* Booking List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {bookings.length === 0
                            ? "No bookings found. Create your first booking to get started."
                            : "No bookings match your search criteria."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                            onDelete={handleDeleteClick}
                            isUpcoming={isUpcoming}
                        />
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setBookingToDelete(null);
                }}
                onConfirm={() => {
                    if (bookingToDelete && onDeleteBooking) {
                        onDeleteBooking(bookingToDelete._id);
                    }
                    setShowDeleteModal(false);
                    setBookingToDelete(null);
                }}
                title="Delete Booking"
                message={
                    bookingToDelete ? (
                        <span>
                            Are you sure you want to delete{" "}
                            <strong className="font-bold text-gray-900">
                                {bookingToDelete.vehicleId?.name ||
                                    "Vehicle Not Found"}
                            </strong>{" "}
                            booking? This action cannot be undone.
                        </span>
                    ) : (
                        "Are you sure you want to delete this booking? This action cannot be undone."
                    )
                }
                itemName={
                    bookingToDelete
                        ? `Booking ID: ${bookingToDelete._id.slice(-6)}`
                        : "this booking"
                }
            />
        </div>
    );
};

export default BookingList;
