const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    const databaseInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connected to MongoDB !! HOST : ${databaseInstance.connection.host}`
    );
  } catch (err) {
    console.log(`Db Connection Failed :`, err);
    process.exit(1);
  }
};
module.exports = { connectToDB };
