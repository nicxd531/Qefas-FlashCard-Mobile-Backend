import {
  checkUserLikeStatus,
  CreateAiCards,
  CreateBulkCards,
  CreateCard,
  createCardsCollection,
  deleteCard,
  deleteCollection,
  generateHuggingFace,
  getCard,
  getCollectionLikes,
  getCollectionWithCards,
  getLatestCollection,
  getPublicCollectionsCategories,
  getSuggestedCollections,
  handleLikeCollection,
  updateCard,
  updateCardsCollection,
  updateCorrectCards,
} from "#/controllers/cardsCollection";
import { isVerified, mustAuth } from "#/middleware/auth";
import CardsFileParser from "#/middleware/cardsFileParser";

import { isVerifiedCollection } from "#/middleware/Collection";
import fileParser from "#/middleware/fileParser";
import { validate } from "#/middleware/validator";
import {
  CardsCollectionValidationSchema,
  CardValidationSchema,
} from "#/utils/validationSchema";
import { HUGGING_FACE_API_KEY2 } from "#/utils/variables";
import axios from "axios";
import { Router, Request, Response } from "express";

const router = Router();

router.post(
  "/create",
  mustAuth,
  isVerified,
  fileParser,
  validate(CardsCollectionValidationSchema),
  createCardsCollection
);
router.post("/create-Card", mustAuth, isVerified, CardsFileParser, CreateCard);
router.get(
  "/cards/:collectionId",
  mustAuth,
  isVerified,
  // isVerifiedCollection,
  getCard
);
router.delete("/cards/:collectionId/:cardId", mustAuth, isVerified, deleteCard);
router.delete("/:collectionId", mustAuth, isVerified, deleteCollection);
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
router.get("/:collectionId/cards", getCollectionWithCards);
router.get("/latest-collection", getLatestCollection);
router.get("/suggested-collections", mustAuth, getSuggestedCollections);
router.post("/:collectionId/like", mustAuth, handleLikeCollection);
router.post("/bulk", mustAuth, CreateBulkCards);
router.post("/create-cards-ai", mustAuth, CreateAiCards);
router.post("/generate-hugging", mustAuth, generateHuggingFace);
router.post("/public-category", getPublicCollectionsCategories);
router.put(
  "/correctCards/:collectionId/cards/:cardId/:type",
  updateCorrectCards
);
router.get("/:collectionId/likes", getCollectionLikes);
router.get("/like-status/:collectionId", mustAuth, checkUserLikeStatus);

export default router;
