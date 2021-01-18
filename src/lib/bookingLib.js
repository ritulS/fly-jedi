// required functions to implement booking functionality
const flightDB_ = require("../db/flightRead");
const tripDB_ = require("../db/tripReadWrite");

// function for checking if the booking is still reserved or completed
async function checkBookings(bookings) {
  const currentDate = new Date();
  currentDate.setHours(0);

  for (let booking of bookings) {
    let bool = [false, false];
    if (booking.dates.length == 1) {
      bool[1] = true;
    }

    for (let i in booking.dates) {
      var bkDate = new Date(booking.dates[i]);
      if (bkDate < currentDate) {
        bool[i] = true;
      }
    }
    // when both are true
    if (bool[0] && bool[1]) {
      booking.status = "completed";
      await booking.save();
    }
  }
  return bookings;
}

// function for calculating total cost
async function calcTotalPrice(tripIds) {
  var totalPrice = 0;
  for (let id of tripIds) {
    const trip = await tripDB_.getTrip(id);
    totalPrice =
      totalPrice + (await flightDB_.getFlightPrice(trip.flightDetails._id));
  }
  return totalPrice;
}

// function to check if the booking's date is valid or not
function checkDateValidity(endDate) {
  var currDate = new Date();
  currDate.setHours(0);
  currDate.setMinutes(0);
  currDate.setSeconds(0);
  currDate.setMilliseconds(0);

  if (currDate > new Date(endDate)) {
    return false;
  }
  return true;
}

module.exports = { checkBookings, calcTotalPrice, checkDateValidity };
