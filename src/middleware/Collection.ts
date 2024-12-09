import CardsCollection from "#/models/cardsCollection";
import { RequestHandler } from "express";

export const isVerifiedCollection: RequestHandler = async (req, res, next) => {
  const { collectionId } = req.body;

  try {
    if (!collectionId) {
      res.status(403).json({
        error: "no collection id",
        message: "Collection Id Required for this action",
      });
      return;
    }
    const collection = await CardsCollection.findById(collectionId);

    if (!collection) {
      res.status(403).json({
        error: "collection not found ",
        message: "this collection doesn't seem to exist",
      });
    }
  } catch (err) {
    res.status(403).json({
      error: err,
      message: "internal server error",
    });
    return;
  }

  next();
};
