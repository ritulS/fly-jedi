// file for reading from database
const Flight = require("./flightSchema");

async function getFlights(dayOfTravel, start, destination) {
  const flights = await Flight.find({
    dayOfFlight: dayOfTravel,
    startingAirport: start,
    destinationAirport: destination,
  });
  return flights;
}

async function getFlightPrice(flightId) {
  const { price } = await Flight.findById(flightId);
  return price;
}

const flightDB_ = {
  getFlights,
  getFlightPrice,
};

module.exports = flightDB_;
