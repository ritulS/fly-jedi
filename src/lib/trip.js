// file for exposing the DB trip read and write functions
const { concat } = require("lodash");
const tripDB_ = require("../db/tripReadWrite");

// function for getting trip data
async function getTripData(tripId) {
  const tp = await tripDB_.getTrip(tripId);

  // removing critical data from seatbookings
  let seatBookings = [];
  for (let booking of tp.seatBookings) {
    seatBookings.push(booking.seat);
  }

  const trip = {
    _id: tp._id,
    date: tp.date,
    flightDetails: tp.flightDetails,
    seatBookings,
  };

  return trip;
}

async function getTripDataForUpdate(tripId, pnr) {
  const tp = await tripDB_.getTrip(tripId);

  // removing critical data from seatbookings
  let seatBookings = [];
  for (let booking of tp.seatBookings) {
    if (booking._id != pnr) {
      seatBookings.push(booking.seat);
    }
  }

  const trip = {
    _id: tp._id,
    date: tp.date,
    flightDetails: tp.flightDetails,
    seatBookings,
  };

  return trip;
}

// function for getting all trip ids, both one way and round trip
async function getTripIdsAndTravelRoute(date, flightIds, date2, flightIds2) {
  const trip1 = await getTIDsAndTR(date, flightIds);
  var trip2 = [];
  if (date2) {
    trip2 = await getTIDsAndTR(date2, flightIds2);
  }
  const tripIds = trip2["trip"]
    ? trip1["trip"].concat(trip2["trip"])
    : trip1["trip"];
  const travelRoute = trip1["travelRoute"];
  return { tripIds, travelRoute };
}

// function for getting tripIds using authPNR
async function getTripIdsWithBooking(booking) {
  var tripIds = [];
  for (flight of booking.flightDetails) {
    tripIds.push(flight._id);
  }
  return tripIds;
}

// function for getting all trip ids with data and a list of flightIds
async function getTIDsAndTR(date, flightIds) {
  let trip = [];
  let travelRoute = [];
  const flID1 = flightIds.shift();

  let tp1 = await tripDB_.getTripByDateAndFID(date, flID1);
  if (!tp1) {
    tp1 = await tripDB_.newTrip(date, flID1);
  }
  trip.push(tp1._id);
  travelRoute.push(tp1.flightDetails.startingAirport);
  travelRoute.push(tp1.flightDetails.destinationAirport);

  for (let flightId of flightIds) {
    let tp = await tripDB_.getTripByDateAndFID(date, flightId);
    if (!tp) {
      tp = await tripDB_.newTrip(date, flightId); // if no trip is found, then create a new trip
    }
    trip.push(tp._id); // pushing the id of the trip into the list
    travelRoute.push(tp.flightDetails.destinationAirport);
  }
  return { trip, travelRoute };
}

const tripDB = {
  getTripData,
  getTripDataForUpdate,
  getTripIdsAndTravelRoute,
  getTripIdsWithBooking,
};

module.exports = tripDB;
