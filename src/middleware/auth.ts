import passwordResetToken from "#/models/passwordResetToken";
import User from "#/models/User";
import { JWT_SECRET } from "#/utils/variables";
import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export const isValidPasswordResetToken: RequestHandler = async (
  req,
  res,
  next
) => {
  // user data
  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({
    owner: userId,
  });
  if (!resetToken) {
    res.status(403).json({ error: "Unauthorised access,invalid token" });
    return;
  }

  const matched = await resetToken.compareToken(token);

  if (!matched) {
    res.status(403).json({ error: "Unauthorised access,invalid token" });
    return;
  }

  next();
};

export const mustAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];

  if (!token) {
    res.status(403).json({ error: "Unauthorised request" });
    return;
  }

  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const id = payload.userId;

  const user = await User.findOne({ _id: id, tokens: token });
  if (!user) {
    res.status(403).json({ error: "Unauthorised request!" });
    return;
  }
  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    backgroundCover: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
  req.token = token;
  next();
};

export const isVerified: RequestHandler = (req, res, next) => {
  if (!req.user.verified) {
    res
      .status(403)
      .json({
        error: "non verifies user",
        message:
          "only verified users can create cards!, please verify your account!",
      });
    return;
  }
  next();
};
