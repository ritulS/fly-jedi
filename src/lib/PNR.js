// implement algorithm to create PNR number calculation
const Booking = require("../db/bookingSchema");

// function to return the string of the month booked in
function getMonthStr(month) {
  const months = [
    "JN",
    "FB",
    "MH",
    "AP",
    "MY",
    "JN",
    "JL",
    "AG",
    "SP",
    "OT",
    "NV",
    "DC",
  ];
  return months[month];
}

async function getLastBooking(month, year) {
  const regexMonth = new RegExp(getMonthStr(month) + year);
  const lastBooking = await Booking.aggregate([
    {
      $match: {
        _id: {
          $regex: regexMonth,
        },
      },
    },
    {
      $project: {
        _id: 1,
        pnr: {
          $substr: ["$_id", 4, 8],
        },
      },
    },
    {
      $sort: {
        pnr: -1,
      },
    },
  ]);
  return lastBooking.length != 0 ? lastBooking[0]._id.toString() : false; // returning the lastBooking's pnr
}

function convertToASCIICode(pnr) {
  const asciiCode = [
    pnr.charCodeAt(4),
    pnr.charCodeAt(5),
    pnr.charCodeAt(6),
    pnr.charCodeAt(7),
  ];
  return asciiCode;
}

function generateNewAsciiCode(asciiCode) {
  for (let i = 3; i > -1; i--) {
    if (asciiCode[i] < 90) {
      asciiCode[i] = asciiCode[i] + 1;
      for (let j = i + 1; j < 4; j++) {
        asciiCode[j] = 65;
      }
      break;
    }
  }
  return asciiCode;
}

// function for generating a completely new PNR
async function generateNewPNR() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const latestPNR = await getLastBooking(
    currentMonth,
    currentYear.toString().substring(2)
  );
  if (latestPNR) {
    const newASCIICode = generateNewAsciiCode(convertToASCIICode(latestPNR));
    return (
      getMonthStr(currentMonth) +
      currentYear.toString().substring(2) +
      String.fromCharCode(newASCIICode[0]) +
      String.fromCharCode(newASCIICode[1]) +
      String.fromCharCode(newASCIICode[2]) +
      String.fromCharCode(newASCIICode[3])
    );
  } else {
    return (
      getMonthStr(currentMonth) + currentYear.toString().substring(2) + "AAAA"
    );
  }
}

module.exports = generateNewPNR;
