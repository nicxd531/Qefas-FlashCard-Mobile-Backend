import { CreatePlaylistRequest } from "#/@types/collection";
import CardsCollection from "#/models/cardsCollection";
import playlist from "#/models/playlist";
import { RequestHandler } from "express";
import { Types } from "mongoose";
import { array } from "yup";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;
  const ownerId = req.user.id;
  if (resId) {
    const cardCollection = await CardsCollection.findById(resId);
    if (!CardsCollection) {
      res.status(404).json({
        error: "collection not found ",
        message: "collection does not exit",
      });
      return;
    }
  }

  const newPlaylist = new playlist({
    title,
    owner: ownerId,
    visibility,
  });
  //   const newId = new Types.ObjectId(resId)
  if (resId) newPlaylist.items = [resId as any];
  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
};
