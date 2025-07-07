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
  previous:{
    correctCards: ObjectId[];
    points: number;
    progress: number;
    durationInSeconds: number;
  }

}

const CardDataSchema = new Schema<CardsDataDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      unique: true,
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
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
    },
    durationInSeconds: {
      type: Number,
      default: 0,
    },
    previous: {
      correctCards: [
        {
          type: Schema.Types.ObjectId,
          ref: "Cards",
        },
      ],
      points: {
        type: Number,
        default: 0,
      },
      progress: {
        type: Number,
        default: 0,
      },
      durationInSeconds: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
)

const CardsData = models.CardsData || model("CardsData", CardDataSchema);
export default CardsData as Model<CardsDataDocument>;
