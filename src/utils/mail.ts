import nodemailer from "nodemailer";
import emailVerificationToken from "#/models/emailVerificationToken";
import {
  MAILTRAP_PASSW,
  MAILTRAP_USER,
  VERIFICATION_EMAIL,
} from "#/utils/variables";
import { generateToken } from "#/utils/helper";
import { generateTemplate } from "#/mail/template";
import path from "path";

const generateMailTransporter = () => {
  //   send verification email
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSW,
    },
  });
  return transport;
};
interface Profile {
  name: string;
  email: string;
  userId: string;
}
// send verification mail
export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();
  const { name, email, userId } = profile;

  // await emailVerificationToken.create({
  //   owner: userId,
  //   token,
  // });
  const welcomeMessage = `hi ${name}, welcome to Qefas Flashcards, an app built to help students and tutors study effectively and link up with other aspiring learners. use  the otp below to verify your email`;
  //   mailtrap and nodemailer
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome message",
    html: generateTemplate({
      title: "welcome to Qefas Flashcrads",
      message: welcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "welcome",
      },
    ],
  });
};

interface Options {
  email: string;
  link: string;
}
// send mail for forget password
export const sendForgetPasswordLink = async (Options: Options) => {
  const transport = generateMailTransporter();
  const { email, link } = Options;

  const message = `we just recived a request that you forgot your pass word. no problem you can use the link below  to create a new password`;
  //   mailtrap and nodemailer
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset Password Link",
    html: generateTemplate({
      title: "Forget Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};
