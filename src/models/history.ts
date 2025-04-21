import { Model, model, models, ObjectId, Schema } from "mongoose";

export type historyType = {
  cardsCollection: ObjectId;
  progress: number;
  points: number;
  date: Date;
};
interface HistoryDocument {
  owner: ObjectId;
  last: historyType;
  all: historyType[];
}

const historySchema = new Schema<HistoryDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last: {
      cardsCollection: {
        type: Schema.Types.ObjectId,
        ref: "CardsCollections",
      },
      progress: Number,
      points: Number,
      date: {
        type: Date,
        required: true,
      },
    },
    all: [
      {
        cardsCollection: {
          type: Schema.Types.ObjectId,
          ref: "CardsCollections",
        },
        progress: Number,
        points: Number,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const History = models.History || model("History", historySchema);
export default History as Model<HistoryDocument>;
