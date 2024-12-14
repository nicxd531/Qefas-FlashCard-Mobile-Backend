import { paginationQuery } from "#/@types/misc";
import History, { historyType } from "#/models/history";
import { RequestHandler } from "express";

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
      id: "$cardsCOllectionInfo._id",
      title: "$cardsCollectionInfo.title",
      about: "$cardsCollectionInfo.about",
      poster: "$cardsCollectionInfo.poster.url",
      category: "$cardsCollectionInfo.category",
      owner: { name: "$owner.name", id: "$owner._id" },
      date: "$histories.date",
      progress: "$histories.progress",
      index: "$index",
    },
  };
  const cardsCollection = await History.aggregate([
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

  res.json({ cardsCollection });
};
