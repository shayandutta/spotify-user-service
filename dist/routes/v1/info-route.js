import express from "express";
import infoController from "../../controller/info-controller.js";
const router = express.Router();
router.get("/", infoController);
export default router;
//# sourceMappingURL=info-route.js.map