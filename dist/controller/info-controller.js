import tryCatch from "../utils/TryCatch.js";
const getInfo = tryCatch(async (req, res) => {
    return res.status(200).json({
        message: "Server is running",
    });
});
export default getInfo;
//# sourceMappingURL=info-controller.js.map