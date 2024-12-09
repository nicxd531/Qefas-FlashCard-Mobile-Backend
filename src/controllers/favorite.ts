import CardsCollection from "#/models/cardsCollection";
import { CardsCollectionDocument } from "#/models/cardsCollection";
import Favorite from "#/models/favorite";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { PopulateFavList } from "../@types/collection";

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
  const favorite = await Favorite.findOne({ owner: userId }).populate<{
    items: PopulateFavList[];
  }>({
    path: "items",
    populate: {
      path: "owner",
    },
  });
  if (!favorite) {
    res.json({ collections: [] });
    return;
  }
  const collections = favorite.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      poster: item.poster?.url,
      owner: {
        name: item.owner.name,
        id: item.owner._id,
        avatar: item.owner.avatar.url,
        followers: item.owner.followers,
        followings: item.owner.followings,
      },
    };
  });
  res.json({ collections });
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
