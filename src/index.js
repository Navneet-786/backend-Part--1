require("dotenv").config();
const express = require("express");
const app = express();
const { connectToDB } = require("./db/index");
connectToDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("server is listen at port :", PORT);
});
