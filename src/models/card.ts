import { Model, model, models, ObjectId, Schema } from "mongoose";

export interface Icards {
  question: string;
  answer: string;
  owner: ObjectId;
  collectionId: ObjectId;
}
const CardSchema = new Schema<Icards>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
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
