import { Model, model, ObjectId, Schema } from "mongoose";

interface userDocument {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: { url: string; publicId: string };
  backgroundCover?: { url: string; publicId: string };
  tokens: string[];
  favourites: ObjectId[];
  followers: ObjectId[];
  followings: ObjectId[];
}

const userSchema = new Schema<userDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: Object,
      url: String,
      publicId: String,
    },
    backgroundCover: {
      type: Object,
      url: String,
      publicId: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    favourites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tokens: [String],
  },
  { timestamps: true }
);

export default model("User", userSchema) as Model<userDocument>;
