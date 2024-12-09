import { createPlaylist, updatePlaylist } from "#/controllers/playlist";
import { isVerified, mustAuth } from "#/middleware/auth";
import { validate } from "#/middleware/validator";
import {
  newPlaylistValidationSchema,
  oldPlaylistValidationSchema,
} from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();
router.post(
  "/create",
  mustAuth,
  isVerified,
  validate(newPlaylistValidationSchema),
  createPlaylist
);
router.patch(
  "/",
  mustAuth,
  validate(oldPlaylistValidationSchema),
  updatePlaylist
);

export default router;
