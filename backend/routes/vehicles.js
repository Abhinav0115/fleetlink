import express from "express";
import {
    createVehicle,
    getVehicle,
    getAllVehicles,
    getAvailableVehicles,
    updateVehicle,
    deleteVehicle,
} from "../controllers/vehicleController.js";

const router = express.Router();
router.post("/", createVehicle);
router.get("/available", getAvailableVehicles);
router.get("/", getAllVehicles);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
