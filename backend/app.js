import cors from "cors";
import morgan from "morgan";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import vehiclesRouter from "./routes/vehicles.js";
import bookingsRouter from "./routes/bookings.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

connectDB();

app.use("/api/vehicles", vehiclesRouter);
app.use("/api/bookings", bookingsRouter);

app.use("/api", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
