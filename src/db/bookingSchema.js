// booking schema

const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const bookingSchema = new mongoose.Schema({
  _id: {
    required: true,
    type: String,
  },
  dates: [String], // will be in the format 'yyyy-mm-dd'
  email: {
    required: true,
    type: String,
    validate(email) {
      if (!validator.isEmail(email)) {
        throw new Error("email is not valid");
      }
    },
  },
  firstName: {
    required: true,
    type: String,
  },
  flightDetails: [
    {
      //_id will be trip Id
      boarding: Date,
      dayOfFlight: String,
      destinationAirport: String,
      flightNumber: String,
      flightType: String,
      gateClose: Date,
      landingTime: Date,
      takeOff: Date,
      startingAirport: String,
    },
  ],
  lastName: {
    required: true,
    type: String,
  },
  phoneNumber: {
    required: true,
    type: Number,
  },
  totalPrice: {
    required: true,
    type: Number,
  },
  seats: [String], //list of seats corresponding to the respective flights
  status: {
    default: "reserved",
    type: String,
  },
  travelRoute: [],
  token: String,
});

bookingSchema.methods.generateToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
      time: Date.now(),
    },
    "-- add your secret key here --"
  );

  this.token = token;
  await this.save();
  return token;
};

bookingSchema.methods.toJSON = function () {
  let booking = this.toObject();
  delete booking.token;
  delete booking.status;
  delete booking.__v;
  return booking;
};

const Booking = mongoose.model("bookings", bookingSchema, "bookings");

module.exports = Booking;
