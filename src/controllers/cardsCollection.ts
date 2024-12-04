import { RequestWithFiles } from "#/middleware/fileParser";
import { categoriesTypes } from "#/models/cards_category";
import { RequestHandler } from "express";
import formidable from "formidable";
import cloudinary from "#/cloud";
import CardsCollection from "#/models/cardsCollection";

interface createCardsCollectionRequest extends RequestWithFiles {
  body: { title: string; description: string; category: categoriesTypes };
}

export const createCardsCollection: RequestHandler = async (
  req: createCardsCollectionRequest,
  res
) => {
  const { title, description, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const ownerId = req.user.id;

  if (!title) {
    res.status(422).json({
      error: "missing title",
      message: "title is required to create collection",
    });
    return;
  }

  const newCollection = new CardsCollection({
    title,
    description,
    category,
    owner: ownerId,
  });

  if (poster) {
    const posterRes = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: "thump",
      gravity: "face",
    });
    newCollection.poster = {
      url: posterRes.secure_url,
      publicId: posterRes.public_id,
    };
  }

  await newCollection.save();
  res.status(201).json({
    collection: {
      title,
      description,
      poster: newCollection.poster?.url,
    },
  });
};
export const CreateCard: RequestHandler = (req, res) => {};
