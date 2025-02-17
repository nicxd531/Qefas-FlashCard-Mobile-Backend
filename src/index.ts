import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth";

const app = express();
// register our middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found nicx");
});

app.use("/auth", authRouter);
const PORT = process.env.PORT || 8989;

app.listen(PORT, () => {
  console.log("port is listening on port " + PORT);
});

/*
authentication 
login
signup
reset
verifification
change theme
 */
