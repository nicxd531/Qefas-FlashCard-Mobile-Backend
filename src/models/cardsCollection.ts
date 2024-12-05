import { Model, model, models, ObjectId, Schema } from "mongoose";
import { categories, categoriesTypes } from "./cards_category";
import { object, string } from "yup";

export interface CardsCollectionDocument {
  title: string;
  description?: string;
  owner: ObjectId;
  poster?: {
    url: string;
    publicId: string;
  };
  likes: ObjectId[];
  bookmarks: ObjectId[];
  category: categoriesTypes;
  cards: ObjectId[];
  correctCards: ObjectId[];
  visibility: "private" | "public"; // This defines the accepted values for TypeScript
}

const cardsCollectionSchema = new Schema<CardsCollectionDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    poster: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: categories,
      default: "others",
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cards",
      },
    ],
    correctCards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cards",
      },
    ],
    visibility: {
      type: String,
      enum: ["private", "public"], // Only allow "private" or "public"
      default: "private", // Default value is "private"
    },
  },
  {
    timestamps: true,
  }
);

const CardsCollection =
  models.Cards || model("CardsCollection", cardsCollectionSchema);
export default CardsCollection as Model<CardsCollectionDocument>;
