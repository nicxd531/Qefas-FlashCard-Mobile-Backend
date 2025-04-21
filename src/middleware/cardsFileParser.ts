import { IncomingForm } from "formidable";
import type { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      files: any;
    }
  }
}

const parseKey = (key: string) => {
  const path = key
    .replace(/\]/g, "")
    .split("[")
    .map((k) => (isNaN(Number(k)) ? k : Number(k)));
  return path;
};

const setDeep = (obj: any, path: (string | number)[], value: any) => {
  path.reduce((acc, key, i) => {
    if (i === path.length - 1) {
      acc[key] = value;
    } else {
      if (!acc[key]) acc[key] = typeof path[i + 1] === "number" ? [] : {};
      return acc[key];
    }
    return acc;
  }, obj);
};

const cardsFileParser: RequestHandler = async (req, res, next) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    res.status(422).json({ error: "Only accepts form-data!" });
    return next();
  }

  const form = new IncomingForm({ multiples: true });

  const [fields, files] = await form.parse(req);

  req.body = {};
  req.files = {};

  // Parse fields
  for (let key in fields) {
    const path = parseKey(key);
    const fieldValue = fields[key];
    if (fieldValue && fieldValue[0]) {
      setDeep(req.body, path, fieldValue[0]);
    }
  }

  // Parse files
  for (let key in files) {
    const path = parseKey(key);
    const fileValue = files[key];
    if (fileValue && fileValue[0]) {
      setDeep(req.files, path, fileValue[0]);
    }
  }

  next();
};

export default cardsFileParser;
