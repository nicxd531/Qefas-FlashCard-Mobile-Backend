import {
  CreatePlaylistRequest,
  updatePlaylistRequest,
} from "#/@types/collection";
import CardsCollection from "#/models/cardsCollection";
import Playlist from "#/models/playlist";
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

  const newPlaylist = new Playlist({
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

export const updatePlaylist: RequestHandler = async (
  req: updatePlaylistRequest,
  res
) => {
  const { id, item, title, visibility } = req.body;
  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title, visibility },
    { new: true }
  );
  if (!playlist) {
    res.status(404).json({
      error: "playlist not found!",
      message: "playlist not found",
    });
    return;
  }

  if (item) {
    const cardsCollection = await CardsCollection.findById(item);
    if (!cardsCollection) {
      res.status(404).json({
        error: "cardsCollection not found!",
        message: "cards Collection not found",
      });
      return;
    }
    // playlist.items.push(cardsCollection._id);
    // await playlist.save();
    await Playlist.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: item },
    });
  }
  res.status(201).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};
