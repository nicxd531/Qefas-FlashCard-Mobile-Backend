import CardsCollection from "#/models/cardsCollection";
import { CardsCollectionDocument } from "#/models/cardsCollection";
import Favorite from "#/models/favorite";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { PopulateFavList } from "../@types/collection";
import { paginationQuery } from "#/@types/misc";

export const toggleFavorite: RequestHandler = async (req, res) => {
  const collectionId = req.query.collectionId as string;
  let status: "added" | "removed";

  if (!isValidObjectId(collectionId)) {
    res.status(422).json({
      error: "collection Id is invalid ",
      message: "this isn't a valid id ",
    });
    return;
  }

  const cardsCollection = await CardsCollection.findById(collectionId);
  if (!cardsCollection) {
    res.status(404).json({
      error: "Resources  not found ",
      message: "collection not found ",
    });
    return;
  }
  // collection already in favorite
  const alreadyExist = await Favorite.findOne({
    owner: req.user.id,
    items: collectionId,
  });

  if (alreadyExist) {
    // we remove
    await Favorite.updateOne(
      { owner: req.user.id },
      {
        $pull: { items: collectionId },
      }
    );
    status = "removed";
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });
    if (favorite) {
      // trying to add new audio to the old list
      await Favorite.updateOne(
        { owner: req.user.id },
        {
          $addToSet: { items: collectionId },
        }
      );
    } else {
      // trying to create a fresh list
      await Favorite.create({
        owner: req.user.id,
        items: [collectionId],
      });
    }
    status = "added";
  }

  if (status === "added") {
    await CardsCollection.findByIdAndUpdate(collectionId, {
      $addToSet: { likes: req.user.id },
    });
  }
  if (status === "removed") {
    await CardsCollection.findByIdAndUpdate(collectionId, {
      $pull: { likes: req.user.id },
    });
  }
  res.json({ status });
};
export const getFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { limit = "20", pageNo = "0" } = req.query as paginationQuery;

  const favorites = await Favorite.aggregate([
    { $match: { owner: userId } },
    {
      $project: {
        collectionIds: {
          $slice: [
            "$items",
            parseInt(limit) * parseInt(pageNo),
            parseInt(limit),
          ],
        },
      },
    },
    {
      $unwind: "$collectionIds",
    },
    {
      $lookup: {
        from: "cardscollections",
        localField: "collectionIds",
        foreignField: "_id",
        as: "collectionInfo",
      },
    },
    {
      $unwind: "$collectionInfo",
    },
    {
      $lookup: {
        from: "users",
        localField: "collectionInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: "$ownerInfo",
    },
    {
      $project: {
        _id: 0,
        id: "$collectionInfo._id",
        title: "$collectionInfo.title",
        description: "$collectionInfo.description",
        category: "$collectionInfo.category",
        poster: "$collectionInfo.poster.url",
        owner: {
          name: "$ownerInfo.name",
          id: "$ownerInfo._id",
          avatar: "$ownerInfo.avatar.url",
        },
      },
    },
  ]);
  res.json({ collection: favorites });
};
export const getIsFavorite: RequestHandler = async (req, res) => {
  const collectionId = req.query.collectionId as string;

  if (!isValidObjectId(collectionId)) {
    res.status(422).json({
      error: "invalid collection id ",
      message: "not a valid collection id ",
    });
    return;
  }
  const favorite = await Favorite.findOne({
    owner: req.user.id,
    items: collectionId,
  });

  res.json({ result: favorite ? true : false });
};
