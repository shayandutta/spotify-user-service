import express from "express";
import InfoRoutes from "./info-routes.js";
import UserRoutes from "./user-routes.js";
const router = express.Router();
router.use("/info", InfoRoutes);
router.use("/users", UserRoutes);
export default router;
//# sourceMappingURL=index.js.map