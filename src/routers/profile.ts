import { isAuth, mustAuth } from "#/middleware/auth";
import { Router } from "express";
import {
  getUploads,
  updateFollower,
  getPublicUploads,
  getPublicProfile,
  getPublicPlaylist,
  getRecommendedByProfile,
  getAutoGeneratedPlaylist,
  getFollowersProfile,
} from "../controllers/profile";

const router = Router();
router.post("/update-follower/:profileId", mustAuth, updateFollower);
router.get("/uploads", mustAuth, getUploads);
router.get("/uploads/:profileId", getPublicUploads);
router.get("/info/:profileId", getPublicProfile);
router.get("/playlist/:profileId", getPublicPlaylist);
router.get("/recommended", isAuth, getRecommendedByProfile);
router.get("/auto-generated-playlist", mustAuth, getAutoGeneratedPlaylist);
router.get("/followers", mustAuth, getFollowersProfile);
export default router;
