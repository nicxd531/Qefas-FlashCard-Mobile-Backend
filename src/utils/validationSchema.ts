import * as yup from "yup";
import { isValidObjectId } from "mongoose";
import { categories } from "#/models/cards_category";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is missing!")
    .min(3, "Name is too short!")
    .max(20, "Name is too long!"),
  email: yup.string().required("Email is missing!").email("Invalid email id!"),
  password: yup
    .string()
    .trim()
    .required("Password is missing!")
    .min(8, "Password is too short!")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password should contain both text, characters and number"
    ),
});

export const TokenAndIdValidation = yup.object().shape({
  token: yup.string().trim().required("invalid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      } else {
        return "";
      }
    })
    .required("invalid userId"),
});

export const UpdatePasswordSchema = yup.object().shape({
  token: yup.string().trim().required("invalid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      } else {
        return "";
      }
    })
    .required("invalid userId"),
  password: yup
    .string()
    .trim()
    .required("Password is missing!")
    .min(8, "Password is too short!")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password should contain both text, characters and number"
    ),
});

export const SignValidationSchema = yup.object().shape({
  email: yup.string().required("Email is missing!").email("Invalid email id!"),
  password: yup.string().trim().required("Password is missing!"),
});
export const CardsCollectionValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing!"),
  description: yup.string().required("description is missing!"),
  category: yup
    .string()
    .oneOf(categories, "invalid category")
    .required("Category is missing!"),
});
export const CardValidationSchema = yup.object().shape({
  question: yup.string().required("Question is missing!"),
  answer: yup.string().required("Answer is missing!"),
});
export const newPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing!"),
  resId: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "visibility must be public or private")
    .required("visibility is missing!"),
});
export const oldPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing!"),
  item: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),
  id: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "visibility must be public or private"),
  // .required("visibility is missing!"),
});
export const UpdateHistorySchema = yup.object().shape({
  cardsCollection: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : "";
    })
    .required("invalid collection Id!"),
  progress: yup.number().required("History progress is missing!!"),
  points: yup.number(),
  date: yup.string().transform(function (value) {
    const date = new Date(value);
    if (date instanceof Date) return value;
    return "";
  }),
});
