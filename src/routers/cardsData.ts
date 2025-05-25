import {
  createCardsData,
  deleteCardsData,
  getCardsData,
  updateCardsData,
} from "#/controllers/cardsData";
import { mustAuth } from "#/middleware/auth";
import { Router } from "express";

const router = Router();
router.post("/", mustAuth, createCardsData);
// update cards data
router.patch("/", mustAuth, updateCardsData);
// get cards data
router.get("/", mustAuth, getCardsData);
// delete cards data
router.delete("/", mustAuth, deleteCardsData);
export default router;
