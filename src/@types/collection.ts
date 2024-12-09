import { ObjectId } from "mongoose";
import { CardsCollectionDocument } from "../models/cardsCollection";
import { Request } from "express";

export type PopulateFavList = CardsCollectionDocument<{
  _id: ObjectId;
  name: string;
  avatar: string;
  followers: ObjectId[];
  followings: ObjectId[];
}>[];

export interface CreatePlaylistRequest extends Request {
  body: { title: string; resId: string; visibility: "public" | "private" };
}
export interface updatePlaylistRequest extends Request {
  body: {
    title: string;
    id: string;
    item: string;
    visibility: "public" | "private";
  };
}
