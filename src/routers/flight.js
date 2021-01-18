/*
 file for getting flight data
 all data will be sent in url params
 */

const express = require("express");
const router = express.Router();
const flightDB = require("../lib/flight");

// on clicking a certain flight data, the flight ids will be sent in the url
router.get("/flights/:datesOfTravel/:start/:destination", async (req, res) => {
  try {
    const flights = await flightDB.flightPlans(
      req.params.datesOfTravel.split(":"), //splitting the dates of travel
      req.params.start,
      req.params.destination
    );
    res.status(200).send(flights);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
