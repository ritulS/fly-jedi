// connecting to the mongodb server
const mongoose = require("mongoose");

async function connectToDB() {
  await mongoose.connect("-- add mongodb url here --", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
}

module.exports = connectToDB;
