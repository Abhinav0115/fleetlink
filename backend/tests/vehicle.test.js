import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import vehiclesRouter from "../routes/vehicles.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

// Load test environment variables
dotenv.config({ path: ".env.test" });

const app = express();
app.use(express.json());
app.use("/api/vehicles", vehiclesRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await mongoose.connection.close();
});

describe("Vehicle API Tests", () => {
    describe("POST /api/vehicles", () => {
        beforeEach(async () => {
            // Clean up before each test - this specific test needs a clean slate
            await Vehicle.deleteMany({});
            await Booking.deleteMany({});
        });

        it("should create a vehicle with valid data", async () => {
            const res = await request(app)
                .post("/api/vehicles")
                .send({ name: "Truck A", capacityKg: 1000, tyres: 6 });

            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe("Truck A");
            expect(res.body.capacityKg).toBe(1000);
            expect(res.body.tyres).toBe(6);
        });

        it("should fail with invalid data", async () => {
            const res = await request(app)
                .post("/api/vehicles")
                .send({ name: "", capacityKg: "not-a-number", tyres: 6 });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    describe("GET /api/vehicles/available", () => {
        let vehicleId;

        beforeEach(async () => {
            // Clean up before each test - complete isolation for availability tests
            await Booking.deleteMany({});
            await Vehicle.deleteMany({});
            
            const vehicle = new Vehicle({
                name: "Test Truck",
                capacityKg: 1000,
                tyres: 6,
            });
            await vehicle.save();
            vehicleId = vehicle._id;
        });

        it("should find available vehicles", async () => {
            const res = await request(app)
                .get("/api/vehicles/available")
                .query({
                    capacityRequired: 500,
                    fromPincode: "110001",
                    toPincode: "110020",
                    startTime: "2023-10-27T10:00:00Z",
                });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].estimatedRideDurationHours).toBe(19);
        });

        it("should exclude vehicles with conflicting bookings", async () => {
            // Create a booking that conflicts with our search
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

            const res = await request(app)
                .get("/api/vehicles/available")
                .query({
                    capacityRequired: 500,
                    fromPincode: "110001",
                    toPincode: "110020",
                    startTime: "2023-10-27T12:00:00Z", // Overlaps with booking
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(0); // No available vehicles
        });

        it("should fail with missing query parameters", async () => {
            const res = await request(app)
                .get("/api/vehicles/available")
                .query({ capacityRequired: 500 }); // Missing other params

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain(
                "Missing required query parameters"
            );
        });
    });

    describe("GET /api/vehicles", () => {
        beforeEach(async () => {
            // Clean up before test - this specific test needs a clean slate
            await Vehicle.deleteMany({});
            await Booking.deleteMany({});
        });

        it("should get all vehicles", async () => {
            await new Vehicle({
                name: "Truck 1",
                capacityKg: 1000,
                tyres: 6,
            }).save();
            await new Vehicle({
                name: "Truck 2",
                capacityKg: 1500,
                tyres: 8,
            }).save();

            const res = await request(app).get("/api/vehicles");

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });
    });
});
