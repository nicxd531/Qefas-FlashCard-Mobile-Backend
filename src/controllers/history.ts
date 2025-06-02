import { paginationQuery } from "#/@types/misc";
import CardsCollection from "#/models/cardsCollection";
import History, { historyType } from "#/models/history";
import { RequestHandler } from "express";
import mongoose from "mongoose";

export const updateHistory: RequestHandler = async (req, res) => {
  const oldHistory = await History.findOne({
    owner: req.user.id,
  });
  const { cardsCollection, progress, date, points } = req.body;
  const history: historyType = { cardsCollection, progress, date, points };
  if (!oldHistory) {
    await History.create({
      owner: req.user.id,
      last: history,
      all: [history],
    });
    res.json({ success: true });
    return;
  }
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $project: {
        _id: 0,
        cardsCollection: "$all.cardsCollection",
      },
    },
  ]);
  const sameDayHistory = histories.find((item) => {
    if (item.cardsCollection.toString() === cardsCollection) return item;
  });

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      {
        owner: req.user.id,
        "all.cardsCollection": cardsCollection,
      },
      {
        $set: {
          "all.$,progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }
  res.json({ success: true });
};
export const removeHistory: RequestHandler = async (req, res) => {
  const removeAll = req.query.all === "yes";
  //   console.log({ removeAll });

  if (removeAll) {
    await History.findOneAndDelete({ owner: req.user.id });
    res.json({ success: true });
    return;
  }
  const histories = req.query.histories as string;
  const ids = JSON.parse(histories) as string[];
  await History.findOneAndUpdate(
    { owner: req.user.id },
    {
      $pull: { all: { _id: ids } },
    }
  );
  res.json({ success: true });
};
export const getHistories: RequestHandler = async (req, res) => {
  const { limit = "20", pageNo = "0" } = req.query as paginationQuery;
  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    {
      $project: {
        all: {
          $slice: ["$all", parseInt(limit) * parseInt(pageNo), parseInt(limit)],
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $lookup: {
        from: "cardscollections",
        localField: "all.cardsCollection",
        foreignField: "_id",
        as: "cardsCollectionInfo",
      },
    },
    {
      $unwind: "$cardsCollectionInfo",
    },
    {
      $project: {
        _id: 0,
        id: "$all._id",
        cardsCollectionId: "$cardsCollectionInfo._id",
        date: "$all.date",
        title: "$cardsCollectionInfo.title",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        cardsCollection: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        cardsCollection: "$$ROOT.cardsCollection",
      },
    },
    { $sort: { date: -1 } },
  ]);
  res.json({ histories });
};
export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = { $match: { owner: req.user.id } };
  const sliceMatch = {
    $project: {
      myHistory: {
        $slice: ["$all", 10],
      },
    },
  };
  const dateSort = {
    $project: {
      histories: {
        $sortArray: {
          input: "$myHistory",
          sortBy: { date: -1 },
        },
      },
    },
  };
  const unWindWithIndex = {
    $unwind: { path: "$histories", includeArrayIndex: "index" },
  };
  const cardsCollectionLookUp = {
    $lookup: {
      from: "cardscollections",
      localField: "histories.cardsCollection",
      foreignField: "_id",
      as: "cardsCollectionInfo",
    },
  };
  const unWindCardsCollectionInfo = {
    $unwind: "$cardsCollectionInfo",
  };
  const userLookUp = {
    $lookup: {
      from: "users",
      localField: "cardsCollectionInfo.owner",
      foreignField: "_id",
      as: "owner",
    },
  };
  const unWindUser = {
    $unwind: "$owner",
  };

  const projectResult = {
    $project: {
      _id: 0,
      id: "$cardsCollectionInfo._id",
      title: "$cardsCollectionInfo.title",
      about: "$cardsCollectionInfo.description",
      poster: "$cardsCollectionInfo.poster.url",
      category: "$cardsCollectionInfo.category",
      owner: { name: "$owner.name", id: "$owner._id" },
      date: "$histories.date",
      progress: "$histories.progress",
      index: "$index",
    },
  };
  const recentlyPlayed = await History.aggregate([
    match,
    sliceMatch,
    dateSort,
    unWindWithIndex,
    cardsCollectionLookUp,
    unWindCardsCollectionInfo,
    userLookUp,
    unWindUser,
    projectResult,
  ]);
  // console.log({ recentlyPlayed });
  res.json({ recentlyPlayed });
};

//  last history ID for a specific collection
//  last history ID for a specific collection
export const getLastHistoryIdForCollection: RequestHandler = async (
  req,
  res
) => {
  const { collectionId } = req.params;
  const userId = req.user.id;

  try {
    let history :any = await History.findOne({ owner: userId }).lean();

    if (!history || !history.all || history.all.length === 0) {
     // No history found for the user, create a new history
      const newHistory = await History.create({
        owner: userId,
        all: [], // Initialize with an empty array
      });
      history = newHistory.toObject(); // Convert to plain JavaScript object
    }

    // Filter history entries for the specified collection
    const collectionHistories = history.all.filter(
      (item:any) => item.cardsCollection.toString() === collectionId
    );

    if (collectionHistories.length === 0) {
     // No history found for the collection, create a new history entry
      const cardsCollection = await CardsCollection.findById(collectionId);
      if (!cardsCollection) {
        res.status(400).json({ message: "Invalid cardsCollection ID", success: false });
        return 
      }

      const newHistoryEntry : any = {
        cardsCollection: new mongoose.Types.ObjectId(collectionId),
        date: new Date(),
        progress: 0, // Initialize with a default progress
        points: 0, // Initialize with default points
      };

      await History.findOneAndUpdate(
        { owner: userId },
        { $push: { all: newHistoryEntry } }
      );

      res.json({ historyId: newHistoryEntry._id  }); // Respond with the new history ID
      return 
    }

    // Find the history entry closest to today's date
    const today = new Date();
    let closestHistory:any = collectionHistories[0];
    let minDiff = Math.abs(today.getTime() - closestHistory.date.getTime());

    for (let i = 1; i < collectionHistories.length; i++) {
      const diff = Math.abs(today.getTime() - collectionHistories[i].date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestHistory = collectionHistories[i];
      }
    }

    res.json({ historyId: closestHistory._id.toString() });
    return
  } catch (error) {
    console.error("Error getting last history ID:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve history ID", success: false });
  }
};