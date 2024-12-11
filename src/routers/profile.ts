import { mustAuth } from "#/middleware/auth";
import { Router } from "express";
import { getUploads, updateFollower ,getPublicUploads} from "../controllers/profile";

const router = Router();
router.post("/update-follower/:profileId", mustAuth, updateFollower);
router.get("/uploads", mustAuth, getUploads);
router.get("/uploads/:profileId", getPublicUploads);
export default router;
