import { CreateUser } from "#/@types/user";
import { validate } from "#/middleware/validator";
import User from "#/models/User";
import { CreateUserSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();
router.post(
  "/create",
  validate(CreateUserSchema),
  async (req: CreateUser, res) => {
    const { email, password, name } = req.body;
    const user = await User.create({ email, password, name });
    res.status(201).json({ user });
  }
);

export default router;
