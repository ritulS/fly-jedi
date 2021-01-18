// file for implementing user recommendations
const _ = require("lodash");

const destinations = ["AJK", "ADR", "DAG", "HSP", "AV7", "CST", "GRL"];

// function for getting unvisitedPlaces
function getUnvisitedPlaces(bookings) {
  var placesVisited = [];
  for (booking of bookings) {
    placesVisited.push(
      booking.travelRoute[0],
      booking.travelRoute[booking.travelRoute.length - 1]
    );
  }
  placesVisited = _.uniq(placesVisited);
  var remainingPlaces = destinations;

  remainingPlaces = remainingPlaces.filter(
    (value) => !placesVisited.includes(value)
  );

  return remainingPlaces;
}

// function for getting least visited places
function getLeastVisitedPlaces(bookings) {
  var visits = [];
  for (let planet of destinations) {
    visits.push({ planet: planet, totalVisits: 0 });
  }

  for (booking of bookings) {
    places = [
      booking.travelRoute[0],
      booking.travelRoute[booking.travelRoute.length - 1],
    ];
    for (place of places) {
      for (vObj of visits) {
        if (vObj.name == place) {
          vObj.totalVisits += 1;
          break;
        }
      }
    }
  }

  _.orderBy(visits, ["totalVisits"], ["desc"]);

  length = visits.length;

  // recommending the least 3 visited planets
  leastVisited = [
    visits[length - 1]["planet"],
    visits[length - 2]["planet"],
    visits[length - 3]["planet"],
  ];

  return leastVisited;
}

function getRecom(bookings) {
  let planets = getUnvisitedPlaces(bookings);
  if (planets.length != 0) {
    return { message: "Planets, yet to visit", planets };
  }
  planets = getLeastVisitedPlaces(bookings);
  return { message: "Visit these planets again?", planets };
}

module.exports = getRecom;
