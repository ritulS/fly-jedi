/*
all data will be sent in the body
*/

const express = require("express");
const authPNR = require("../middleware/authPNR");
const tripDB = require("../lib/trip");

const router = express.Router();

// route for getting all trip ids and travel route for the route, both one way or round trip
router.get("/trip/:date/:flightIds/:date2/:flightIds2", async (req, res) => {
  try {
    const { tripIds, travelRoute } = await tripDB.getTripIdsAndTravelRoute(
      req.params.date,
      req.params.flightIds.split(":"),
      req.params.date2 != "none" ? req.params.date2 : "",
      req.params.flightIds2 != "none" ? req.params.flightIds2.split(":") : ""
    );
    res
      .status(200)
      .cookie("tripIds", tripIds.join(":"), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .cookie("travelRoute", travelRoute.join(":"), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// router for getting trip Ids using authPNR
router.get("/trip/pnr", authPNR, async (req, res) => {
  try {
    const tripIds = await tripDB.getTripIdsWithBooking(req.booking);
    res
      .status(200)
      .cookie("tripIds", tripIds.join(":"), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// route for getting information for a singular trip
router.get("/trip/:id", async (req, res) => {
  try {
    const trip = await tripDB.getTripData(req.params.id);
    res.status(200).send(trip);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

router.get("/trip/:id/update", authPNR, async (req, res) => {
  try {
    const trip = await tripDB.getTripDataForUpdate(
      req.params.id,
      req.booking._id
    );
    res.status(200).send(trip);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
