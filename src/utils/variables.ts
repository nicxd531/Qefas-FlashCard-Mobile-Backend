const { env } = process as { env: { [key: string]: string } };
export const {
  MONGO_URI,
  MAILTRAP_USER,
  MAILTRAP_PASSW,
  VERIFICATION_EMAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
  JWT_SECRET,
  CLOUD_NAME,
  CLOUD_KEY,
  CLOUD_SECRET,
  OPENAI_API_KEY,
  HUGGING_FACE_API_KEY2,
} = env;
