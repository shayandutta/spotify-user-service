import express from "express";
import { UserController } from "../../controllers/index.js";
const router = express.Router();
router.post("/register", UserController.registerUser);
export default router;
//# sourceMappingURL=user-routes.js.map