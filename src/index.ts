import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth";
import cardsCollectionRouter from "./routers/cardsCollection";
import favoriteRouter from "./routers/favorite";

const app = express();
// register our middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/collection", cardsCollectionRouter);
app.use("/favorite", favoriteRouter);
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
