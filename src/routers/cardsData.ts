import {
  createCardsData,
  deleteCardsData,
  getCardsData,
  getPreviousCardsData,
  updateCardsData,
} from "#/controllers/cardsData";
import { mustAuth } from "#/middleware/auth";
import { Router } from "express";

const router = Router();
router.post("/", mustAuth, createCardsData);
// update cards data
router.patch("/", mustAuth, updateCardsData);
// get cards data
router.get("/:historyId/:collectionId", mustAuth, getCardsData);
// delete cards data
router.delete("/", mustAuth, deleteCardsData);
// previous  cards data
router.patch("/previous", mustAuth, updateCardsData);
router.get("/previous/:historyId/:collectionId", mustAuth, getPreviousCardsData);
export default router;
