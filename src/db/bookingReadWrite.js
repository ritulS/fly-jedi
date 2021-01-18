// for reading and writing bookings from the database

const Booking = require("./bookingSchema");
const Trip = require("./tripSchema");

async function findWithEDP(email, dates, phoneNumber) {
  console.log(email, dates, phoneNumber);
  const booking = await Booking.findOne({
    email,
    dates,
    phoneNumber,
    status: "reserved",
  });
  return booking;
}

async function findWithPNR(pnr) {
  const booking = await Booking.findOne({
    _id: pnr,
  });
  return booking;
}

async function findWithPNRandLastName(pnr, lastName) {
  const booking = await Booking.findOne({
    _id: pnr,
    lastName,
    status: "reserved",
  });
  return booking;
}

async function getAllBookingsByEmail(email) {
  const bookings = await Booking.find({
    email,
  });
  return bookings;
}

async function newBooking(
  { pnr, email, firstName, lastName, phoneNumber, seats },
  totalPrice,
  tripIds,
  travelRoute
) {
  let trips = [];
  let dates = [];
  for (let id of tripIds) {
    const trip = await Trip.findById(id);
    trips.push(trip);
    if (dates.indexOf(trip.date) == -1) {
      dates.push(trip.date);
    }
  }

  let tripFlightDetails = [];
  for (let fg of trips) {
    let details = fg.flightDetails;
    details._id = fg._id; // saving the trip _id in place of flight id
    tripFlightDetails.push(details);
  }

  const booking = new Booking({
    _id: pnr,
    dates,
    email,
    firstName,
    flightDetails: tripFlightDetails,
    lastName,
    phoneNumber,
    seats,
    totalPrice,
    travelRoute,
  });
  await booking.save();
  return booking;
}

const bookingDB_ = {
  findWithEDP,
  findWithPNR,
  findWithPNRandLastName,
  getAllBookingsByEmail,
  newBooking,
};

module.exports = bookingDB_;
