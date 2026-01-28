import express from "express";
import { registerUser } from "../../controller/controller.js";
import infoRoutes from "./info-route.js";
const router = express.Router();
router.post("/register", registerUser);
router.get("/info", infoRoutes);
export default router;
//# sourceMappingURL=route.js.map