import { Model, model, ObjectId, Schema } from "mongoose";
import { hash, compare } from "bcrypt";
// typescript interface
interface emailVerificationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface methods {
  compareToken(token: string): Promise<boolean>;
}
// expires after one hour
const emailVerificationTokenSchema = new Schema<
  emailVerificationTokenDocument,
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
emailVerificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    //hash token
    this.token = await hash(this.token, 10);
  }
  next();
});
// function to compare token
emailVerificationTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};
export default model(
  "EmailVerificationToken",
  emailVerificationTokenSchema
) as Model<emailVerificationTokenDocument, {}, methods>;
