import { Model, model, models, ObjectId, Schema } from "mongoose";
import { text } from "stream/consumers";

export interface CardsDataDocument<T = ObjectId> {
  collectionId: ObjectId;
  owner: ObjectId;
  historyId: ObjectId;
  user: ObjectId;
  points: number;
  durationInSeconds: number;
  cards: ObjectId[];
  correctCards: ObjectId[];
  progress: number;

}
const CardDataSchema = new Schema<CardsDataDocument>(
  {
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
    historyId: {
      type: Schema.Types.ObjectId,
      ref: "CardsCollection",
      required: true,
      unique: true, // Ensure each historyId is unique
    },
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
    points: {
      type: Number,
      default: 0, // Default points for each card
    },
    progress:{
      type: Number,
      default: 0, // Default progress for each card
    },
    durationInSeconds: {
      type: Number,
      default: 0, // Default points for each card
    },
  },
  {
    timestamps: true,
  }
);

const CardsData = models.CardsData || model("CardsData", CardDataSchema);
export default CardsData as Model<CardsDataDocument>;
