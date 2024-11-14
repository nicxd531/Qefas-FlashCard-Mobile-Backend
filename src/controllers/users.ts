import { RequestHandler } from "express";
import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import User from "#/models/User";
import { generateToken } from "#/utils/helper";
import { sendForgetPasswordLink, sendVerificationMail } from "#/utils/mail";
import EmailVerificationToken from "#/models/emailVerificationToken";
import { isValidObjectId } from "mongoose";
import emailVerificationToken from "#/models/emailVerificationToken";
import passwordResetToken from "#/models/passwordResetToken";
import crypto from "crypto";
import { PASSWORD_RESET_LINK } from "#/utils/variables";

export const create: RequestHandler = async (req: CreateUser, res) => {
  // user data
  const { email, password, name } = req.body;
  //   create user
  const user = await User.create({ email, password, name });

  //   send verification email
  const token = generateToken();
  await emailVerificationToken.create({
    owner: user._id,
    token,
  });
  sendVerificationMail(token, { name, email, userId: user._id.toString() });
  res.status(201).json({ user: { id: user._id, name, email } });
};

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  // user data
  const { token, userId } = req.body;
  // find verification token
  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  // compare the tokens
  if (!verificationToken)
    return res.status(403).json({ error: "invalid token!" });
  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "invalid token!" });

  await User.findByIdAndUpdate(userId, { verified: true });
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
  res.json({ message: "your email is verified" });
};

export const sendReVerificationToken: RequestHandler = async (req, res) => {
  // user data
  const { userId } = req.body;
  // find verification token
  const user = await User.findById(userId);
  if (!isValidObjectId(user))
    return res.status(403).json({ error: "invalid request!" });
  if (!user) return res.status(403).json({ error: "invalid request!" });

  await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });
  const token = generateToken();
  EmailVerificationToken.create({
    owner: userId,
    token,
  });
  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString(),
  });
  res.json({ message: "please check your mail." });
};

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  // user data
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "account not found" });
  //link generation
  const token = crypto.randomBytes(36).toString("hex");
  await passwordResetToken.findOneAndDelete({
    owner: user._id,
  });
  await passwordResetToken.create({
    owner: user._id,
    token,
  });
  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;
  sendForgetPasswordLink({ email: user.email, link: resetLink });
  res.json({ message: "check your registerd mail" });
};

export const isValidPasswordResetToken: RequestHandler = async (req, res) => {
  // user data
  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({
    owner: userId,
  });
  if (!resetToken)
    return res.status(403).json({ error: "Unauthorised access,invalid token" });

  const matched = await resetToken.compareToken(token);

  if (!matched)
    return res.status(403).json({ error: "Unauthorised access,invalid token" });

  res.json({ message: "your token is valid" });
};
