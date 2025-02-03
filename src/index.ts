import express from "express";
import "dotenv/config";
import "express-async-errors";
import "./db";
import authRouter from "./routers/auth";
import cardsCollectionRouter from "./routers/cardsCollection";
import favoriteRouter from "./routers/favorite";
import playlistRouter from "./routers/playlist";
import profileRouter from "./routers/profile";
import historyRouter from "./routers/history";
import "./utils/schedule";
import { errorHandler } from "./middleware/error";

const cors = require("cors");

const app = express();
// register our middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));
app.use(cors());

app.use("/auth", authRouter);
app.use("/collection", cardsCollectionRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);
// app.use("/", (req, res) => {
//   console.log("Root route accessed");
//   res.send("Welcome to the root route!");
// });

app.use(errorHandler);
const PORT = process.env.PORT || 8989;

app.listen(PORT, () => {
  console.log("port is listening on port " + PORT);
});

/*
authentication 
login
signup
reset
verification
change theme
 */
