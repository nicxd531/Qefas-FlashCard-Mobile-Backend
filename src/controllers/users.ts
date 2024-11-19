import { RequestHandler } from "express";
import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import User from "#/models/User";
import { generateToken } from "#/utils/helper";
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
import { PASSWORD_RESET_LINK } from "#/utils/variables";
import jwt from "jsonwebtoken"



// function for creating new users
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
    res.status(403).json({ error: "invalid request!" });
    return;
  }
  if (!user) {
    res.status(403).json({ error: "invalid request!" });
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
  res.json({ message: "check your registerd mail" });
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
    email
  })

  if(!user){
    res.status(403).json({error:"email/password missmatch!"})
    return}
    // compare the password
   const matched = await  user.comparePassword(password)
   if(!matched){
    res.status(403).json({error:"email/password mismatch!"})
    return;
   }

  //  generate token 
 jwt.sign({})
};
