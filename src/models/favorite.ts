import { Model, model, models } from "mongoose";
import { ObjectId, Schema } from "mongoose";

interface FavoriteDocument {
  owner: ObjectId;
  items: ObjectId[];
}
const favoriteSchema = new Schema<FavoriteDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [{ type: Schema.Types.ObjectId, ref: "CardsCollection" }],
  },
  {
    timestamps: true,
  }
);

const Favorite = models.Favorite || model("Favorite", favoriteSchema);
export default Favorite as Model<FavoriteDocument>;
