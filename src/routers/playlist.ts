import {
  createPlaylist,
  removePlaylist,
  updatePlaylist,
  getPlaylistByProfile,
  getCardsCollections
} from "#/controllers/playlist";
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
router.delete("/", mustAuth, removePlaylist);
router.get("/by-profile", mustAuth, getPlaylistByProfile);
router.get("/:playlistId", mustAuth, getCardsCollections);

export default router;
