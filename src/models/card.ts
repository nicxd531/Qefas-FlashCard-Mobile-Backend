import { Model, model, models, ObjectId, Schema } from "mongoose";
import { text } from "stream/consumers";

export interface Icards {
  question: string;
  answer: string;
  owner: ObjectId;
  collectionId: ObjectId;
}
const CardSchema = new Schema<Icards>(
  {
    question: [
      {
        text: {
          type: String,
          default: null,
        },
        image: {
          type: Object,
          url: String,
          publicId: String,
        },
      },
    ],
    answer: [
      {
        text: {
          type: String,
          default: null,
        },
        image: {
          type: Object,
          url: String,
          publicId: String,
        },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "CardsCollection",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Card = models.Cards || model("Cards", CardSchema);
export default Card as Model<Icards>;
