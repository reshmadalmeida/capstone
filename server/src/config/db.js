const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
  } catch (err) {
    console.log("Unable to connect to Database.");
    process.exit(1);
  }
};

module.exports = connectToDb;
