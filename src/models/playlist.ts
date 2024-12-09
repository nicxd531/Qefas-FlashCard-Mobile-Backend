import { Model, model, models, ObjectId, Schema } from "mongoose";

interface playlistDocument {
  title: string;
  owner: ObjectId;
  items: ObjectId[];
  visibility: "public" | "private" | "auto";
}

const playlistSchema = new Schema<playlistDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "CardsCollection",
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "auto"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

const playlist = models.playlist || model("Playlist", playlistSchema);
export default playlist as Model<playlistDocument>;
