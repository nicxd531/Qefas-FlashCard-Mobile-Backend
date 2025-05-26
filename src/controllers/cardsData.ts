import { RequestWithFiles } from "#/middleware/fileParser";
import { categoriesTypes } from "#/models/cards_category";
import CardsCollection from "#/models/cardsCollection";
import CardsData from "#/models/cardsData";
import History from "#/models/history";
import User from "#/models/User";
import { RequestHandler } from "express";
import { ObjectId } from "mongoose";

interface createCardsCollectionRequest extends RequestWithFiles {
  body: {
    collectionId: String;
    owner: String;
    historyId: String;
    user: String;
    points: number;
    progress: number;
    cards: String[];
    correctCards: String[];
  };
}
export const createCardsData: RequestHandler = async (req, res) => {
  const { cards, owner, collectionId, historyId } = req.body;
  const user = req.user.id;
  const isValidHistory = await History.findById(historyId);
  const isValidCollection = await CardsCollection.findById(collectionId);
  const isValidOwner = await User.findById(owner);
  if (!isValidHistory || !isValidCollection || !isValidOwner) {
    res
      .status(400)
      .json({ message: "Invalid history, collection, or owner ID." });
    return;
  }

  if (!owner) {
    res.status(400).json({ message: "Invalid owner ID." });
    return;
  }
  if (!collectionId) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  if (!historyId) {
    res.status(400).json({ message: "Invalid history ID." });
    return;
  }
  try {
    const cardsData = await CardsData.create({
      owner,
      collectionId,
      historyId,
      user,
      cards,
      correctCards: [],
      points: 0,
      durationInSeconds: 0,
    });
    res.status(201).json(cardsData);
  } catch (error) {
    console.error("Error creating cards data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// get cards data by collectionId and historyId

export const getCardsData: RequestHandler = async (req, res) => {
  
   const { collectionId, historyId }= req.params;
  const user = req.user.id;
  const isValidCollection = await CardsCollection.findById(collectionId);
  const isValidHistory = await History.findById(historyId);
  if (!isValidCollection) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  if (!isValidHistory) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  try {
    const cardsData = await CardsData.findOne({
      user: user, // Use the logged-in user's ID
      collectionId: collectionId,
      historyId: historyId,
    });
    if (!cardsData) {
      res.status(404).json({ message: "Cards data not found." });
      return;
    }
    res.status(200).json(cardsData);
    return;
  } catch (error) {
    console.error("Error fetching cards data:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

// Update cards data by collectionId and historyId

export const updateCardsData: RequestHandler = async (req, res) => {
  const {
    collectionId,
    historyId,
    correctCards,
    cards,
    points,
    progress, 
    durationInSeconds,
  } = req.body;
  const user = req.user.id;
  const isValidCollection = await CardsCollection.findById(collectionId);
  const isValidHistory = await History.findById(historyId);
  if (!isValidCollection) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  if (!isValidHistory) {
    res.status(400).json({ message: "Invalid history ID." });
    return;
  }
  try {
    const updateFields: {
      cards?: String[];
      correctCards?: String[];
      points?: number;
      progress?: number;
      durationInSeconds?: number;
    } = {};

    if (correctCards !== undefined) {
      const correctCardsArray = Array.isArray(correctCards) ? correctCards : [];

      // Separate correct and incorrect cards
      const correct = cards.filter((cardId: String) =>
        correctCardsArray.includes(cardId)
      );
      const incorrect = cards.filter(
        (cardId: String) => !correctCardsArray.includes(cardId)
      );

      // Function to shuffle an array (Fisher-Yates shuffle)
      const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // Shuffle both correct and incorrect cards
      const shuffledCorrect = shuffleArray(correct);
      const shuffledIncorrect = shuffleArray(incorrect);

      // Combine shuffled incorrect cards first, then shuffled correct cards
      const reorderedCards = shuffledIncorrect.concat(shuffledCorrect);
      updateFields.cards = reorderedCards;
      updateFields.correctCards = correctCardsArray;
    }

    if (points !== undefined) {
      updateFields.points = points;
    }
    if (progress !== undefined) {
      updateFields.progress = progress;
    }

    if (durationInSeconds !== undefined) {
      updateFields.durationInSeconds = durationInSeconds;
    }

    const updatedCardsData = await CardsData.findOneAndUpdate(
      { user: user, collectionId: collectionId, historyId: historyId },
      {
        $set: updateFields,
      },
      { new: true }
    );

    if (!updatedCardsData) {
      res.status(404).json({ message: "Cards data not found." });
      return;
    }

    res.status(200).json(updatedCardsData);
    return;
  } catch (error) {
    console.error("Error updating cards data:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

// Delete cards data by collectionId and historyId
export const deleteCardsData: RequestHandler = async (req, res) => {
  const { collectionId, historyId } = req.body;
  const user = req.user.id;

  const isValidCollection = await CardsCollection.findById(collectionId);
  const isValidHistory = await History.findById(historyId);
  if (!isValidCollection) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  if (!isValidHistory) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
  try {
    const deletedCardsData = await CardsData.findOneAndDelete({
      user: user,
      collectionId: collectionId,
      historyId: historyId,
    });
    if (!deletedCardsData) {
      res.status(404).json({ message: "Cards data not found." });
      return;
    }
    res.status(200).json({ message: "Cards data deleted successfully." });
    return;
  } catch (error) {
    console.error("Error deleting cards data:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
