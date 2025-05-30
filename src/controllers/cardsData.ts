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
  if (!isValidCollection) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
   // Validate historyId by checking if it exists in the user's history
    const userHistory:any = await History.findOne({ owner: user });

    if (!userHistory || !userHistory.all) {
      res.status(400).json({ message: "History not found for user" });
      return 
    }

    const historyIdExists = userHistory.all.some(
      (item:any) => item._id.toString() === historyId
    );

    if (!historyIdExists) {
      res.status(400).json({ message: "Invalid history ID or user does not own this history." });
      return 
    }
  try {
    const cardsData = await CardsData.findOne({
      owner: user, // Use the logged-in user's ID
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
    previous,
  } = req.body;
  const user = req.user.id;
  const isValidCollection = await CardsCollection.findById(collectionId);
  if (!isValidCollection) {
    res.status(400).json({ message: "Invalid collection ID." });
    return;
  }
 
    // Validate historyId by checking if it exists in the user's history
    const userHistory:any = await History.findOne({ owner: user });

    if (!userHistory || !userHistory.all) {
      res.status(400).json({ message: "History not found for user" });
      return 
    }

    const historyIdExists = userHistory.all.some(
      (item:any) => item._id.toString() === historyId
    );

    if (!historyIdExists) {
      res.status(400).json({ message: "Invalid history ID or user does not own this history." });
      return 
    }
  try {
    // Fetch the existing CardsData
    let existingCardsData = await CardsData.findOne({
      user: user,
      collectionId: collectionId,
      historyId: historyId,
    });

    if (!existingCardsData) {
      // Check if a CardsData document with this historyId already exists
      const existingCardsDataWithHistoryId = await CardsData.findOne({ historyId: historyId });
      if (existingCardsDataWithHistoryId) {
        // Respond with an error if a document with this historyId already exists
        res.status(400).json({ message: "A CardsData document with this historyId already exists." });
        return 
      }
      // Create new CardsData if it doesn't exist
      existingCardsData = await CardsData.create({
        owner: user,
        collectionId: collectionId,
        historyId: historyId,
        cards: [],
        correctCards: [],
        points: 0,
        progress: 0,
        durationInSeconds: 0,
        previous: {}, // Or initialize with default values
      });
    }

    // Create an object to hold the updated fields, starting with the existing data
    const updateFields: {
      cards?: String[];
      correctCards?: String[];
      points?: number;
      progress?: number;
      durationInSeconds?: number;
      previous?: {
        correctCards?: String[];
        points?: number;
        progress?: number;
        durationInSeconds?: number;
      };
    } = {
      cards: existingCardsData.cards.map(id => id.toString()),
      correctCards: existingCardsData.correctCards.map(id => id.toString()),
      points: existingCardsData.points,
      progress: existingCardsData.progress,
      durationInSeconds: existingCardsData.durationInSeconds,
      previous: {
        correctCards: existingCardsData.previous?.correctCards?.map(id => id.toString()),
        points: existingCardsData.previous?.points,
        progress: existingCardsData.previous?.progress,
        durationInSeconds: existingCardsData.previous?.durationInSeconds,
      },
    };

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
      // Handle the nested 'previous' field
    if (previous !== undefined) {
      updateFields.previous = {
        correctCards:
          previous.correctCards !== undefined
            ? previous.correctCards
            : existingCardsData.previous?.correctCards,
        points:
          previous.points !== undefined
            ? previous.points
            : existingCardsData.previous?.points,
        progress:
          previous.progress !== undefined
            ? previous.progress
            : existingCardsData.previous?.progress,
        durationInSeconds:
          previous.durationInSeconds !== undefined
            ? previous.durationInSeconds
            : existingCardsData.previous?.durationInSeconds,
      };
    }

    const updatedCardsData = await CardsData.findOneAndUpdate(
      { owner: user, collectionId: collectionId, historyId: historyId },
      {
        $set: updateFields,
      },
      { new: true, upsert: true }
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
      owner: user,
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


// get previous cards data by collectionId and historyId
export const getPreviousCardsData: RequestHandler = async (req, res) => {
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
    res.status(200).json(cardsData.previous);
    return;
  } catch (error) {
    console.error("Error fetching cards data:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};