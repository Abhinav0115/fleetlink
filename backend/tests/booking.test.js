import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bookingsRouter from "../routes/bookings.js";
import vehiclesRouter from "../routes/vehicles.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

// Load test environment variables
dotenv.config({ path: ".env.test" });

const app = express();
app.use(express.json());
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/bookings", bookingsRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await Booking.deleteMany({});
    await Vehicle.deleteMany({});
    await mongoose.connection.close();
});

describe("Booking API Tests", () => {
    let vehicleId;

    beforeEach(async () => {
        // Clean up before each test
        await Booking.deleteMany({});
        await Vehicle.deleteMany({});

        // Create a test vehicle
        const vehicle = new Vehicle({
            name: "Test Truck",
            capacityKg: 1000,
            tyres: 6,
        });
        await vehicle.save();
        vehicleId = vehicle._id; // Keep as ObjectId, not string
    });

    describe("POST /api/bookings", () => {
        beforeEach(async () => {
            // Additional cleanup for this test suite
            await Booking.deleteMany({});
        });

        it("should create a booking with valid data", async () => {
            const bookingData = {
                vehicleId: vehicleId.toString(), // Convert to string for API
                fromPincode: "110001",
                toPincode: "110020",
                startTime: "2023-10-27T10:00:00Z",
                customerId: "customer123",
            };

            const res = await request(app)
                .post("/api/bookings")
                .send(bookingData);

            expect(res.statusCode).toBe(201);
            expect(res.body.vehicleId).toBe(vehicleId.toString());
            expect(res.body.estimatedRideDurationHours).toBe(19); // Math.abs(110020 - 110001) % 24
            expect(res.body.fromPincode).toBe("110001");
            expect(res.body.toPincode).toBe("110020");
        });

        it("should fail with missing required fields", async () => {
            const res = await request(app)
                .post("/api/bookings")
                .send({ vehicleId });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Missing required fields.");
        });

        it("should fail with non-existent vehicle", async () => {
            const bookingData = {
                vehicleId: "507f1f77bcf86cd799439011", // fake ObjectId
                fromPincode: "110001",
                toPincode: "110020",
                startTime: "2023-10-27T10:00:00Z",
                customerId: "customer123",
            };

            const res = await request(app)
                .post("/api/bookings")
                .send(bookingData);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Vehicle not found");
        });

        it("should detect booking conflicts", async () => {
            const bookingData = {
                vehicleId: vehicleId.toString(),
                fromPincode: "110001",
                toPincode: "110020",
                startTime: "2023-10-27T10:00:00Z",
                customerId: "customer123",
            };

            // Create first booking
            await request(app).post("/api/bookings").send(bookingData);

            // Try to create conflicting booking
            const conflictingBooking = {
                ...bookingData,
                startTime: "2023-10-27T15:00:00Z", // Overlaps with first booking
                customerId: "customer456",
            };

            const res = await request(app)
                .post("/api/bookings")
                .send(conflictingBooking);

            expect(res.statusCode).toBe(409);
            expect(res.body.error).toBe(
                "Vehicle is already booked for this time slot."
            );
        });
    });

    describe("GET /api/bookings", () => {
        beforeEach(async () => {
            // Additional cleanup for this test suite
            await Booking.deleteMany({});
        });

        it("should get all bookings", async () => {
            // Create a booking first
            const booking = new Booking({
                vehicleId,
                fromPincode: "110001",
                toPincode: "110020",
                startTime: new Date("2023-10-27T10:00:00Z"),
                endTime: new Date("2023-10-28T05:00:00Z"),
                customerId: "customer123",
                estimatedRideDurationHours: 19,
            });
            await booking.save();

            const res = await request(app).get("/api/bookings");

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].vehicleId).toBeDefined();
            expect(res.body[0].vehicleId._id).toBeDefined();
            expect(res.body[0].vehicleId.name).toBe("Test Truck");
            expect(res.body[0].fromPincode).toBe("110001");
            expect(res.body[0].customerId).toBe("customer123");
        });
    });

    describe("DELETE /api/bookings/:id", () => {
        beforeEach(async () => {
            // Additional cleanup for this test suite
            await Booking.deleteMany({});
        });

        it("should delete a booking", async () => {
            const booking = new Booking({
                vehicleId,
                fromPincode: "110001",
                toPincode: "110020",
                startTime: new Date("2023-10-27T10:00:00Z"),
                endTime: new Date("2023-10-28T05:00:00Z"),
                customerId: "customer123",
                estimatedRideDurationHours: 19,
            });
            await booking.save();

            const res = await request(app).delete(
                `/api/bookings/${booking._id}`
            );

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Booking cancelled successfully");
        });
    });
});
