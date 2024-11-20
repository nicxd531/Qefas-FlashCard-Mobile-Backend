import { userDocument } from "#/models/User";

export const generateToken = (lenght = 6) => {
  let otp = "";

  for (let i = 0; i < lenght; i++) {
    let digit = Math.floor(Math.random() * 10);
    otp += digit;
  }
  return otp;
};

export const formatProfile = (user: userDocument) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    backgroundCover: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
};
