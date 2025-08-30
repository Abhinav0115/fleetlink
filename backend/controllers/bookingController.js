import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

// POST /api/bookings: Create a booking
export const createBooking = async (req, res) => {
    try {
        const { vehicleId, fromPincode, toPincode, startTime, customerId } =
            req.body;
        if (
            !vehicleId ||
            !fromPincode ||
            !toPincode ||
            !startTime ||
            !customerId
        ) {
            return res.status(400).json({ error: "Missing required fields." });
        }
        // Calculate ride duration
        const estimatedRideDurationHours =
            Math.abs(parseInt(toPincode) - parseInt(fromPincode)) % 24;
        const bookingEndTime = new Date(
            new Date(startTime).getTime() +
                estimatedRideDurationHours * 60 * 60 * 1000
        );
        // Check vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        // Check for booking conflicts
        const conflict = await Booking.findOne({
            vehicleId,
            $or: [
                {
                    startTime: { $lt: bookingEndTime },
                    endTime: { $gt: new Date(startTime) },
                },
            ],
        });
        if (conflict) {
            return res.status(409).json({
                error: "Vehicle is already booked for this time slot.",
            });
        }
        // Create booking
        const booking = new Booking({
            vehicleId,
            fromPincode,
            toPincode,
            startTime: new Date(startTime),
            endTime: bookingEndTime,
            customerId,
            estimatedRideDurationHours,
        });

        await booking.save();

        // Populate the vehicle data before returning
        const populatedBooking = await Booking.findById(booking._id).populate(
            "vehicleId"
        );
        res.status(201).json(populatedBooking);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// GET /api/bookings/:id: Get booking by ID with vehicle details
export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate("vehicleId");
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// GET /api/bookings/: Get all bookings with vehicle details
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate("vehicleId");
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// DELETE /api/bookings/:id: Delete booking by ID
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
