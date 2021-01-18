// file for attaching all the routes with the express server

const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const path = require("path");

const bookingRouter = require("./routers/booking");
const flightRouter = require("./routers/flight");
const tripRouter = require("./routers/trips");
const userRouter = require("./routers/user");

const app = express();
const public = path.join(__dirname, "../public");

app.use(express.static(public));
app.use(cookieParser());
app.use(cors()); // remove after testing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bookingRouter);
app.use(flightRouter);
app.use(tripRouter);
app.use(userRouter);

module.exports = app;
