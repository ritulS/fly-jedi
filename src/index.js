// file for connecting with the mongo database and starting the server

const http = require("http");
const app = require("./app");
const connect = require("./db/connectToDB");

const server = http.createServer(app);
server.listen(80, () => {
  console.log("server is up and running on port", 80);
});

connect()
  .then(() => {
    console.log("e-Travel app is now up and running");
  })
  .catch((e) => {
    console.log("fatally and totally failed, maha failure!");
    console.log(e);
  });
