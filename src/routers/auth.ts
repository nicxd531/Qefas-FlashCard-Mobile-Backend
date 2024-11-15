import {
  create,
  generateForgetPasswordLink,
  grantValid,
  sendReVerificationToken,
  updatePassword,
  verifyEmail,
} from "#/controllers/users";
import { isValidPasswordResetToken } from "#/middleware/auth";
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
  isValidPasswordResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(TokenAndIdValidation),
  isValidPasswordResetToken,
  updatePassword
);

export default router;
