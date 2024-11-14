import { compare, hash } from "bcrypt";
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
interface Methods {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<userDocument, {}, Methods>(
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

// function to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    //hash token
    this.password = await hash(this.password, 10);
  }
  next();
});
// function to compare password
userSchema.methods.comparePassword = async function (password) {
  const result = await compare(password, this.password);
  return result;
};
export default model("User", userSchema) as Model<userDocument, {}, Methods>;
