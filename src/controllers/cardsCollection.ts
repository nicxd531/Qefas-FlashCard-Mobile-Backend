import { RequestWithFiles } from "#/middleware/fileParser";
import { categoriesTypes } from "#/models/cards_category";
import { RequestHandler } from "express";
import formidable from "formidable";
import cloudinary from "#/cloud";
import CardsCollection from "#/models/cardsCollection";
import Card from "#/models/card";

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
  const exist = await CardsCollection.findOne({
    owner: ownerId,
    title: title,
  });
  if (exist) {
    res.status(422).json({
      error: "user already has the collection",
      message: "collection already exist",
    });
    return;
  }

  if (!title) {
    res.status(422).json({
      error: "missing title",
      message: "title is required to create collection",
    });
    return;
  }

  try {
    const newCollection = await new CardsCollection({
      title,
      description,
      category,
      owner: ownerId,
    });
    if (poster) {
      const posterRes = await cloudinary.uploader.upload(poster.filepath, {
        width: 300,
        height: 300,
        crop: "thumb",
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
        collectionId: newCollection._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
export const CreateCard: RequestHandler = async (req, res) => {
  const { answer, question, collectionId } = req.body;
  const ownerId = req.user.id;

  if (!answer || !question) {
    res.status(422).json({
      error: "missing answer or question",
      message: "question and answer is required to create card",
    });
  }
  try {
    const newCard = new Card({
      answer: answer,
      question: question,
      owner: ownerId,
      collectionId: collectionId,
    });

    await newCard.save();
    res.status(201).json({
      card: {
        answer,
        question,
        collectionId,
      },
    });
  } catch (err) {
    res.status(201).json({ error: err });
  }
};
