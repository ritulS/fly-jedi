// file for exposing the DB booking read and write functions
const bookingDB_ = require("../db/bookingReadWrite");
const tripDB_ = require("../db/tripReadWrite");
const {
  checkBookings,
  calcTotalPrice,
  checkDateValidity,
} = require("./bookingLib");
const generateNewPNR = require("./PNR");

// function for cancelling booking both from the booking database and the trip database
async function cancelBooking(booking) {
  for (let flight of booking.flightDetails) {
    await tripDB_.cancelBooking(flight._id, booking._id);
  }
  booking.status = "cancelled"; // cancelling the booking
  await booking.save();
}

// add option to change add-ons
async function changeBooking(booking, seats, email) {
  for (let i in booking.flightDetails) {
    // for changing the seats in the trip database
    await tripDB_.changeSeatAndEmail(
      booking.flightDetails[i]._id,
      booking._id,
      email,
      seats[i]
    );
  }
  booking.seats = seats;
  booking.email = email; //for updating the email as well
  await booking.save();
}

async function findWithEDP(email, dates, phoneNumber) {
  const booking = await bookingDB_.findWithEDP(email, dates, phoneNumber);
  const validity = checkDateValidity(booking.dates[booking.dates.length - 1]); // checking whether booking is valid or not
  if (!validity) {
    booking.status = "completed";
    await booking.save();
    throw new Error();
  }
  const token = await booking.generateToken();
  return token;
}

async function findWithPNR(pnr) {
  const booking = await bookingDB_.findWithPNR(pnr);
  const validity = checkDateValidity(booking.dates[booking.dates.length - 1]); // checking whether booking is valid or not
  if (!validity) {
    booking.status = "completed";
    await booking.save();
    throw new Error();
  }
  const token = await booking.generateToken();
  return token;
}

async function findWithPNRandLastName(pnr, lastName) {
  const booking = await bookingDB_.findWithPNRandLastName(pnr, lastName);
  const validity = checkDateValidity(booking.dates[booking.dates.length - 1]); // checking whether booking is valid or not
  if (!validity) {
    booking.status = "completed";
    await booking.save();
    throw new Error();
  }
  const token = await booking.generateToken();
  return token;
}

// function for getting all bookings, also updating the booking by checking the current time
async function getAllUserBookings(email) {
  var bookings = await bookingDB_.getAllBookingsByEmail(email);
  bookings = await checkBookings(bookings); // updating bookings based on the current time
  return bookings;
}

/* 
function for creating a new booking
userDetails will contain email, phoneNumber, firstName, lastName, 
row[], seat[]
*/
async function newBooking(userDetails, tripIds, travelRoute) {
  userDetails.pnr = await generateNewPNR();

  // adding passenger to the various trips
  for (let i in tripIds) {
    await tripDB_.addPassenger(tripIds[i], {
      _id: userDetails.pnr,
      email: userDetails.email,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      seat: userDetails.seats[i],
    });
  }

  // creating the booking
  const booking = await bookingDB_.newBooking(
    userDetails,
    await calcTotalPrice(tripIds),
    tripIds,
    travelRoute
  );
  const token = await booking.generateToken();
  return token;
}

const bookingDB = {
  cancelBooking,
  changeBooking,
  findWithEDP,
  findWithPNR,
  findWithPNRandLastName,
  getAllUserBookings,
  newBooking,
};

module.exports = bookingDB;
