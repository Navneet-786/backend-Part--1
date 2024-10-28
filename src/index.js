require("dotenv").config();
const { app } = require("./app");
const { connectToDB } = require("./db/index");

const PORT = process.env.PORT || 8080;

connectToDB()
  .then(() => {
    app.on("error", (err) => {
      console.error(`server error : ${err}`);
    });
    app.listen(PORT, () => {
      console.log("server is listen at port :", PORT);
    });
  })
  .catch((err) => {
    console.log(`Something configuration error: ${err}`);
    process.exit(1);
  });
