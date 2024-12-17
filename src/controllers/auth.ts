import { RequestHandler } from "express";
import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import User from "#/models/User";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  sendForgetPasswordLink,
  sendPassResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import EmailVerificationToken from "#/models/emailVerificationToken";
import { isValidObjectId } from "mongoose";
import emailVerificationToken from "#/models/emailVerificationToken";
import passwordResetToken from "#/models/passwordResetToken";
import crypto from "crypto";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/variables";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "#/middleware/fileParser";
import cloudinary from "#/cloud";
import formidable from "formidable";

// function for creating new users
export const create: RequestHandler = async (req: CreateUser, res) => {
  // user data
  const { email, password, name } = req.body;

  const alreadyAUser = await User.findOne({ email });
  if (alreadyAUser) {
    res.status(409).json({
      error: "User already exists",
      message: "the email is already associated with an account",
    });
    return;
  }
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
// function for veridying email
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
  if (!verificationToken) {
    res.status(403).json({ error: "invalid token!" });
    return;
  }
  const matched = await verificationToken.compareToken(token);

  if (!matched) {
    res.status(403).json({ error: "invalid token!" });
    return;
  }

  await User.findByIdAndUpdate(userId, { verified: true });
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
  res.json({ message: "your email is verified" });
};

// function for sending verification mail
export const sendReVerificationToken: RequestHandler = async (req, res) => {
  // user data
  const { userId } = req.body;
  // find verification token
  const user = await User.findById(userId);
  if (!isValidObjectId(user)) {
    res
      .status(403)
      .json({ error: "invalid request!", message: "invalid request!" });
    return;
  }
  if (!user) {
    res
      .status(403)
      .json({ error: "invalid request!", message: "user not found!" });
    return;
  }
  if (user.verified) {
    res.status(422).json({
      error: "invalid request, account verified!",
      message: "user is already verified!",
    });
    return;
  }

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
// controller for generating for get password link
export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  // user data
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ error: "account not found" });
    return;
  }
  const token = crypto.randomBytes(36).toString("hex");
  await passwordResetToken.findOneAndDelete({
    owner: user._id,
  });
  await passwordResetToken.create({
    owner: user._id,
    token,
  });
  //resetLink generation
  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;
  // send forget password link email'
  sendForgetPasswordLink({ email: user.email, link: resetLink });
  res.json({ message: "check your registered mail" });
};

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};
export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(403).json({ error: "Unauthorized access!" });
    return;
  }

  const matched = await user.comparePassword(password);
  if (matched) {
    res.status(422).json({ error: "The new password must be different!" });
    return;
  }
  user.password = password;
  await user.save();
  await passwordResetToken.findOneAndDelete({ owner: user._id });
  // send the success email
  sendPassResetSuccessEmail(user.name, user.email);
  res.json({ message: "Password resets successfully." });
};

export const signIn: RequestHandler = async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    res.status(403).json({ error: "email/password missmatch!" });
    return;
  }
  // compare the password
  const matched = await user.comparePassword(password);
  if (!matched) {
    res.status(403).json({ error: "email/password mismatch!" });
    return;
  }
  //  generate token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  user.tokens.push(token);

  await user.save();

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      backgroundCover: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    },
    token,
  });
};
export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;
  const avatar = req.files?.avatar as formidable.File;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("something went wrong, user not found!");

  if (typeof name !== "string") {
    res.status(422).json({ error: "invalid name" });
    return;
  }

  if (name.trim().length < 3) {
    res.status(422).json({ error: "invalid name" });
    return;
  }
  user.name = name;

  if (avatar) {
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }
    const { secure_url, url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );
    user.avatar = { url: secure_url, publicId: public_id };
  }

  await user.save();
  res.json({ profile: formatProfile(user) });
};

export const sendProfile: RequestHandler = (req, res) => {
  res.json({
    profile: req.user,
  });
};
export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;
  const token = req.token;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("something went wrong, user not found!");
  //  loggOut from all

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((t) => t !== token);

  await user.save();
  res.json({ success: true });
};
