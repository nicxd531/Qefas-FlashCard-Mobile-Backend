import {
  CreateCard,
  createCardsCollection,
} from "#/controllers/cardsCollection";
import { isVerified, mustAuth } from "#/middleware/auth";
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
  "/create-Crads",
  mustAuth,
  isVerified,
  validate(CardValidationSchema),
  CreateCard
);

export default router;
