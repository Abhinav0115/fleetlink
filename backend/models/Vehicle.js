import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        capacityKg: { type: Number, required: true, min: 1 },
        tyres: { type: Number, required: true, min: 2 },
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
