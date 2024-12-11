import User from "#/models/User";
import { RequestHandler } from "express";
import { isValidObjectId, ObjectId } from "mongoose";
import { paginationQuery } from "../@types/misc";
import CardsCollection, {
  CardsCollectionDocument,
} from "#/models/cardsCollection";

export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  let status: "added" | "removed";

  if (!isValidObjectId(profileId)) {
    res.status(422).json({
      error: "invalid profile id",
      message: "profile id is invalid",
    });
    return;
  }
  const profile = await User.findById(profileId);
  if (!profile) {
    res.status(404).json({
      error: "profile not found!",
      message: "profile not found!",
    });
    return;
  }

  const alreadyAFollower = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });
  if (alreadyAFollower) {
    await User.updateOne(
      {
        _id: profileId,
      },
      {
        $pull: { followers: req.user.id },
      }
    );
    status = "removed";
  } else {
    await User.updateOne(
      {
        _id: profileId,
      },
      {
        $addToSet: { followers: req.user.id },
      }
    );
    status = "added";
  }

  if (status === "added") {
    // update the following list (add)
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $addToSet: { followings: profileId },
      }
    );
  }
  if (status === "removed") {
    // remove the following list (add)
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { followings: profileId },
      }
    );
  }
  res.json({ status });
};
export const getUploads: RequestHandler = async (req, res) => {
  const { limit = "20", pageNo = "0" } = req.query as paginationQuery;
  const data = await CardsCollection.find({ owner: req.user.id })
    .skip(parseInt(limit) * parseInt(pageNo))
    .limit(parseInt(limit))
    .sort("-createdAt");
  const cardsCollection = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      description: item.description,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: {
        name: req.user.name,
        id: req.user.id,
      },
    };
  });
  res.json({ cardsCollection });
};
export const getPublicUploads: RequestHandler = async (req, res) => {
  const { limit = "20", pageNo = "0" } = req.query as paginationQuery;
  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) {
    res.status(422).json({
      error: "invalid profile id ",
      message: "profile id not valid ",
    });
    return;
  }
  const data = await CardsCollection.find({ owner: profileId })
    .skip(parseInt(limit) * parseInt(pageNo))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .populate<CardsCollectionDocument<{ name: string; _id: ObjectId }>>(
      "owner"
    );
  const cardsCollection = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      description: item.description,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: {
        name: item.owner.name,
        id: item.owner._id,
      },
    };
  });
  res.json({ cardsCollection });
};
