// file for exposing the backend functions for reading flight
// will use the djikstra algorithm if no routes are found, will create an own route
// get flight will send back an array of all flights, each will create a new object

const flightDB_ = require("../db/flightRead");
const djikstraGetShortestRoute = require("./djikstra");

const week = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// function to convert a date to a day of the week
function convertDateToDay(dateOfTravel) {
  const date = new Date(dateOfTravel);
  return week[date.getDay()];
}

async function getFlights(dateOfTravel, start, destination) {
  const dayOfTravel = convertDateToDay(dateOfTravel);

  var flights = await flightDB_.getFlights(dayOfTravel, start, destination);

  if (flights.length == 0) {
    /*
    if there are no flights found, use djikstra to get the shortest route,
    {
      flightIds: [all the ids of the flights in flightDetails]
      flights:[{flightDetails}]
      travelRoute:[] the total number of flights will always be travelRoute.length - 1
      add duration, takeoff time - landing time, price
    }
    */
    var flightIds = [];
    var fls = []; // for flightDetails
    var price = 0;
    const travelRoute = djikstraGetShortestRoute(start, destination);

    for (let i = 0; i < travelRoute.length - 1; i++) {
      flights = await flightDB_.getFlights(
        dayOfTravel,
        travelRoute[i],
        travelRoute[i + 1]
      );

      // the first flight should be a morning flight so that route matching works
      if (fls.length == 0) {
        for (flight of flights) {
          // only push the flight into the list if it is a morning flight
          if (flight.takeOff < new Date(2000, 0, 1, 8, 30)) {
            fls.push(flight);
            flightIds.push(flight._id);
            price = price + flight.price;
            break;
          }
        }
      } else {
        // finding the least duration between locations
        min = null;
        for (let flight of flights) {
          if (
            (flight.takeOff > fls[fls.length - 1].landingTime && min == null) ||
            (flight.takeOff > fls[fls.length - 1].landingTime &&
              flight.takeOff < min.takeOff)
          ) {
            min = flight;
          }
        }
        // pushing the fastest route into fls
        fls.push(min);
        flightIds.push(min._id);
        price = price + min.price;
      }
    }

    let time = new Date(fls[fls.length - 1].landingTime - fls[0].takeOff);
    let duration =
      time.getUTCHours().toString() +
      " Hours " +
      time.getUTCMinutes().toString() +
      " Minutes";
    var ft = {
      dateOfTravel,
      duration,
      flightIds,
      flights: fls,
      landingTime: fls[fls.length - 1].landingTime,
      price,
      takeOffTime: fls[0].takeOff,
      travelRoute,
    };
    return [ft];
  } else {
    var flgs = [];
    for (let flight of flights) {
      travelRoute = [flight.startingAirport, flight.destinationAirport];
      let time = new Date(flight.landingTime - flight.takeOff);
      let duration =
        time.getUTCHours().toString() +
        " Hours " +
        time.getUTCMinutes().toString() +
        " Minutes";
      flgs.push({
        dateOfTravel,
        duration,
        flightIds: [flight._id],
        flights: [flight],
        landingTime: flight.landingTime,
        price: flight.price,
        takeOffTime: flight.takeOff,
        travelRoute,
      });
    }
    flights = flgs;
  }
  return flights;
}

async function flightPlans(datesOfTravel, start, destination) {
  const srt = await getFlights(datesOfTravel[0], start, destination);
  var ret = [];
  // user wants to book return flight as well
  if (datesOfTravel.length == 2) {
    ret = await getFlights(datesOfTravel[1], destination, start);
  }
  return {
    startFlights: srt,
    returnFlights: ret,
  };
}

const flightDB = {
  flightPlans,
};

module.exports = flightDB;
