/*
user route file
all data will be sent in url params
*/

const express = require("express");
const path = require("path");

const auth = require("../middleware/auth");
const userDB = require("../lib/user");

const router = express.Router();
const public = path.join(__dirname, "../../public");

// route for getting all user data
router.get("/user", auth, async (req, res) => {
  try {
    const user = await userDB.getUserInfo(req.user);
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// router for getting user recommendation
router.get("/user/recom", auth, async (req, res) => {
  try {
    const recom = await userDB.getUserRecommendations(req.user);
    res.status(200).send(recom);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// route to check if token is valid
router.post("/user", auth, (req, res) => {
  res.status(200).send({
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    profilePic: req.user.profilePic,
    phoneNumber: req.user.phoneNumber,
  });
});

// for new user
router.post(
  "/user/:email/:firstName/:lastName/:password/:phoneNumber",
  async (req, res) => {
    try {
      const token = await userDB.newUser(req.params);
      res
        .cookie("token", token, {
          path: "/",
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          // sameSite: "strict",
        })
        .status(201)
        .send();
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  }
);

// route for signing in or creating a new account with google
router.post("/user/:token/google", async (req, res) => {
  try {
    const token = await userDB.googleUserSignIn(req.params.token);
    res
      .cookie("token", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(200)
      .send();
  } catch (e) {
    res.status(400).send();
    console.log(e);
  }
});

// for signing in
router.post("/user/:email/:password", async (req, res) => {
  try {
    const token = await userDB.userSignIn({
      email: req.params.email,
      password: req.params.password,
    });
    res
      .cookie("token", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(200)
      .send();
  } catch (e) {
    res.status(401).send();
    console.log(e);
  }
});

// for signing out
router.post("/user/out", auth, async (req, res) => {
  try {
    await userDB.userSignOut(req.user, req.token);
    res
      .clearCookie("token", {
        path: "/",
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(200)
      .send();
  } catch (e) {
    res.status(400).send();
    console.log(e);
  }
});

// for signing out all
router.post("/user/all", auth, async (req, res) => {
  try {
    await userDB.userSignOutAll(req.user);
    res
      .clearCookie("token", {
        path: "/",
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(200)
      .send();
  } catch (e) {
    res.status(400).send();
    console.log(e);
  }
});

// for updating user
router.patch(
  "/user/:email/:firstName/:lastName/:phoneNumber",
  auth,
  async (req, res) => {
    try {
      await userDB.userUpdate(req.user, req.params);
      res.status(201).send();
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  }
);

// for updating user password
router.patch("/user/:password", auth, async (req, res) => {
  try {
    await userDB.userUpdatePassword(req.user, req.params);
    res.status(201).send();
  } catch (e) {
    res.status(400).send();
    console.log(e);
  }
});

router.get("/*", (req, res) => {
  res.sendFile("index.html", { root: public });
});

module.exports = router;
