import History from "#/models/history";
import { userDocument } from "#/models/User";
import { Request } from "express";
import moment from "moment";

export const generateToken = (length = 6) => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    let digit = Math.floor(Math.random() * 10);
    otp += digit;
  }
  return otp;
};

export const formatProfile = (user: userDocument) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    backgroundCover: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
};

export const getUserPreviousHistory = async (
  req: Request
): Promise<string[]> => {
  const [result] = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
    },
    { $group: { _id: "$all.cardsCollection" } },
    {
      $lookup: {
        from: "cardscollections",
        localField: "_id",
        foreignField: "_id",
        as: "collectionData",
      },
    },
    { $unwind: "$collectionData" },
    {
      $group: {
        _id: null,
        category: { $addToSet: "$collectionData.category" },
      },
    },
  ]);

  if (result) {
    return result.category;
  }

  return [];
};
