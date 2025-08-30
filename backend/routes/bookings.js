import express from "express";
import {
    createBooking,
    deleteBooking,
    getBooking,
    getAllBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/:id", getBooking);
router.delete("/:id", deleteBooking);

export default router;
