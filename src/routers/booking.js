/* 
file for creating booking router
bookings can only be changed using PNR
for these routes, the data will be sent in the body - {newBooking, changeBooking}
*/

const express = require("express");

const auth = require("../middleware/auth");
const authPNR = require("../middleware/authPNR");
const bookingDB = require("../lib/booking");

const router = express.Router();

// route for getting booking data using authPNR
router.get("/booking", authPNR, (req, res) => {
  res.status(200).send(req.booking);
});

router.get("/booking/seats", authPNR, (req, res) => {
  res.status(200).send(req.booking.seats);
});

// for getting a booking token using userAuth and PNR
router.get("/booking/:pnr", auth, async (req, res) => {
  try {
    const token = await bookingDB.findWithPNRandLastName(
      req.params.pnr,
      req.user.lastName
    );
    res
      .status(200)
      .cookie("tokenPNR", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// for getting a booking token using pnr and lastName
router.get("/booking/:pnr/:lastName", async (req, res) => {
  try {
    const token = await bookingDB.findWithPNRandLastName(
      req.params.pnr,
      req.params.lastName
    );
    res
      .status(200)
      .cookie("tokenPNR", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

/* 
for getting a booking status using dates of travel, email, phonenumber
date will be sent as string(format) = yyyy-mm-dd
*/
router.get("/booking/:email/:dates/:phoneNumber", async (req, res) => {
  try {
    const token = await bookingDB.findWithEDP(
      req.params.email,
      req.params.dates.split(":"),
      parseInt(req.params.phoneNumber)
    );
    res
      .status(200)
      .cookie("tokenPNR", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// for cancelling a booking using PNR number
router.delete("/booking", authPNR, async (req, res) => {
  try {
    await bookingDB.cancelBooking(req.booking);
    res
      .clearCookie("tokenPNR", {
        path: "/",
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(201)
      .send();
  } catch (e) {
    console.log(e);
    res.status(401).send();
  }
});

// for changing seat number using PNR number, all data will be sent in the body
router.patch("/booking", authPNR, async (req, res) => {
  try {
    await bookingDB.changeBooking(
      req.booking,
      req.body.seats.split(":"),
      req.body.email
    );
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

/* 
for creating a new booking, all data will be sent in the body
will send back a pnrAuthToken
*/
router.post("/booking", async (req, res) => {
  try {
    const token = await bookingDB.newBooking(
      {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        seats: req.body.seats.split(":"),
      },
      req.cookies.tripIds.split(":"),
      req.cookies.travelRoute.split(":")
    );
    res
      .status(201)
      .cookie("tokenPNR", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
