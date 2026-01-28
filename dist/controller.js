import tryCatch from "./TryCatch.js";
import { User } from "./models/model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const registerUser = tryCatch(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
        message: "User created successfully",
        user: newUser,
        token: token
    });
});
//# sourceMappingURL=controller.js.map