import { Model, model, ObjectId, Schema } from "mongoose";
import { hash, compare } from "bcrypt";
// typescript interface
interface passwordResetTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface methods {
  compareToken(token: string): Promise<boolean>;
}
// expires after one hour
const passwordResetTokenSchema = new Schema<
  passwordResetTokenDocument,
  {},
  methods
>({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600, //60 min *60 sec =3600s
    default: Date.now(),
  },
});
// function to hash token
passwordResetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    //hash token
    this.token = await hash(this.token, 10);
  }
  next();
});
// function to compare token
passwordResetTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};
export default model("PasswordResetToken", passwordResetTokenSchema) as Model<
  passwordResetTokenDocument,
  {},
  methods
>;
