// file for reading from trip Database

const Trip = require("./tripSchema");
const Flight = require("./flightSchema");

// passenger details will contain email, name, row, seat number, phone number,
async function addPassenger(tripId, passengerDetails) {
  const trip = await getTrip(tripId); // getting the trip
  trip.checkEmailUniqueness(passengerDetails.email); // checking if email entered is indeed unique
  trip.seatBookings.push(passengerDetails);
  await trip.save();
}

// for changing a passenger's seat who has booked a ticket -- add email later on
async function changeSeatAndEmail(tripId, pnr, email, newSeat) {
  var trip = await getTrip(tripId);
  let seatBookings = trip.seatBookings.toObject();
  const index = seatBookings.findIndex((booking) => booking._id == pnr);
  if (seatBookings[index].email != email) {
    trip.checkEmailUniqueness(email);
    seatBookings[index].email = email;
    seatBookings[index].seat = newSeat;
  } else {
    seatBookings[index].seat = newSeat;
  }
  trip.seatBookings = seatBookings;
  await trip.save();
}

// for cancelling a booking on a certain trip
async function cancelBooking(tripId, pnr) {
  const trip = await getTrip(tripId);
  const trip_ = trip.toObject();
  const nwStBks = trip_.seatBookings.filter((booking) => booking._id != pnr);
  trip.seatBookings = nwStBks;
  await trip.save();
}

// function for getting a trip
async function getTrip(tripId) {
  const trip = await Trip.findById(tripId);
  return trip;
}

// function for getting a trip using date, flightId
async function getTripByDateAndFID(date, flightId) {
  const trip = await Trip.findOne({
    date,
    "flightDetails._id": flightId,
  });
  return trip;
}

// for creating a new trip on a certain date
async function newTrip(date, flightId) {
  var dt = date.split("-");
  dt = [parseInt(dt[0]), parseInt(dt[1]) - 1, parseInt(dt[2])];
  const flight = await Flight.findById(flightId);
  const trip = new Trip({
    date,
    flightDetails: {
      _id: flight._id,
      boarding: new Date(
        dt[0],
        dt[1],
        dt[2],
        flight.boarding.getHours(),
        flight.boarding.getMinutes()
      ),
      dayOffFlight: flight.dayOffFlight,
      destinationAirport: flight.destinationAirport,
      duration: flight.duration,
      flightNumber: flight.flightNumber,
      flightType: flight.flightType,
      gateClose: new Date(
        dt[0],
        dt[1],
        dt[2],
        flight.gateClose.getHours(),
        flight.gateClose.getMinutes()
      ),
      landingTime: new Date(
        dt[0],
        dt[1],
        dt[2],
        flight.landingTime.getHours(),
        flight.landingTime.getMinutes()
      ),
      startingAirport: flight.startingAirport,
      takeOff: new Date(
        dt[0],
        dt[1],
        dt[2],
        flight.takeOff.getHours(),
        flight.takeOff.getMinutes()
      ),
    },
    seatBookings: [],
  });

  await trip.save();
  return trip;
}

const tripDB_ = {
  addPassenger,
  changeSeatAndEmail,
  cancelBooking,
  getTrip,
  getTripByDateAndFID,
  newTrip,
};

module.exports = tripDB_;
