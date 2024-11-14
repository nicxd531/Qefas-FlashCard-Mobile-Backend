import {
  create,
  generateForgetPasswordLink,
  isValidPasswordResetToken,
  sendReVerificationToken,
  verifyEmail,
} from "#/controllers/users";
import { validate } from "#/middleware/validator";
import {
  CreateUserSchema,
  TokenAndIdValidation,
} from "#/utils/validationSchema";

import { Router } from "express";

const router = Router();
router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIdValidation),
  isValidPasswordResetToken
);
export default router;
