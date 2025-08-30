import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

// POST /api/vehicles: Create a new vehicle
export const createVehicle = async (req, res) => {
    try {
        const { name, capacityKg, tyres } = req.body;
        if (
            !name ||
            typeof name !== "string" ||
            !capacityKg ||
            typeof capacityKg !== "number" ||
            !tyres ||
            typeof tyres !== "number"
        ) {
            return res.status(400).json({
                error: "Invalid input. Name (string), capacityKg (number), and tyres (number) are required.",
            });
        }

        if (capacityKg < 1 || tyres < 2) {
            return res.status(400).json({
                error: "Invalid input. capacityKg must be at least 1 and tyres must be at least 2.",
            });
        }

        const vehicle = new Vehicle({ name, capacityKg, tyres });
        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// GET /api/vehicles/:id: Get vehicle by ID
export const getVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.status(200).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// GET /api/vehicles/: Get all vehicles
export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json(vehicles);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// PUT /api/vehicles/:id: Update vehicle by ID
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(id, update, {
            new: true,
        });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.status(200).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// GET /api/vehicles/available: Find available vehicles based on capacity and time
export const getAvailableVehicles = async (req, res) => {
    try {
        const { capacityRequired, fromPincode, toPincode, startTime } =
            req.query;

        if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
            return res.status(400).json({
                error: "Missing required query parameters: capacityRequired, fromPincode, toPincode, startTime",
            });
        }

        // Calculate ride duration using the simplified formula
        const estimatedRideDurationHours =
            Math.abs(parseInt(toPincode) - parseInt(fromPincode)) % 24;
        const endTime = new Date(
            new Date(startTime).getTime() +
                estimatedRideDurationHours * 60 * 60 * 1000
        );

        // Find vehicles with sufficient capacity
        const vehicles = await Vehicle.find({
            capacityKg: { $gte: parseInt(capacityRequired) },
        });

        // Filter out vehicles with conflicting bookings
        const availableVehicles = [];
        for (const vehicle of vehicles) {
            const conflict = await Booking.findOne({
                vehicleId: vehicle._id,
                $or: [
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gt: new Date(startTime) },
                    },
                ],
            });

            if (!conflict) {
                availableVehicles.push({
                    ...vehicle.toObject(),
                    estimatedRideDurationHours,
                });
            }
        }

        res.status(200).json(availableVehicles);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

// DELETE /api/vehicles/:id: Delete vehicle by ID
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        // Delete all bookings associated with this vehicle
        const deletedBookings = await Booking.deleteMany({ vehicleId: id });

        // Delete the vehicle
        await Vehicle.findByIdAndDelete(id);

        res.status(200).json({
            message: "Vehicle deleted successfully",
            deletedBookingsCount: deletedBookings.deletedCount,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
