import {
  CreateCard,
  createCardsCollection,
  getLatestCollection,
  updateCard,
  updateCardsCollection,
} from "#/controllers/cardsCollection";
import { isVerified, mustAuth } from "#/middleware/auth";
import { isVerifiedCollection } from "#/middleware/Collection";
import fileParser from "#/middleware/fileParser";
import { validate } from "#/middleware/validator";
import {
  CardsCollectionValidationSchema,
  CardValidationSchema,
} from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  mustAuth,
  isVerified,
  fileParser,
  validate(CardsCollectionValidationSchema),
  createCardsCollection
);
router.post(
  "/create-Card",
  mustAuth,
  isVerified,
  isVerifiedCollection,
  validate(CardValidationSchema),
  CreateCard
);
router.patch(
  "/:CardsCollectionId",
  mustAuth,
  isVerified,
  fileParser,
  validate(CardsCollectionValidationSchema),
  updateCardsCollection
);
router.patch(
  "/update-card/:cardId",
  mustAuth,
  isVerified,
  isVerifiedCollection,
  validate(CardValidationSchema),
  updateCard
);
router.get("/latest", getLatestCollection);

export default router;
