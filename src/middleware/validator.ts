import { RequestHandler } from "express";
import * as yup from "yup";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body)
      return res.status(422).json({ error: "empty body is not expected" });
    const {} = req.body;
    const schemaToValidate = yup.object({
      body: schema,
    });
    try {
      await schemaToValidate.validate(
        { body: req.body },
        {
          abortEarly: true,
        }
      );
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(422).json({ error: error.message });
      }
    }
  };
};
