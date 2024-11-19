import passwordResetToken from "#/models/passwordResetToken";
import { RequestHandler } from "express";

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
