const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const auth = require("../auth/auth");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: Storage,
  limits: { fileSize: 100000000 },
});

router.post("/signup", upload.single("Image"), async (req, res) => {
  try {
    let user = req.body;
    user.avtar = req.file.filename;
    if (!user.Username || !user.Emailid || !user.Password) {
      return res.status(422).json({ error: "Please fill all the field" });
    }
    const usernameFind = await userModel.findOne({ Username: user.Username });
    if (usernameFind) {
      return res.status(404).json({ message: "Username already exist" });
    }
    bcrypt.hash(user.Password, 8, (err, hash) => {
      user.Password = hash;
      const users = new userModel(user);
      users.save();
    });
    res.status(200).json({ message: "User signup succesfully" });
  } catch (error) {
    res.status(400).json({ error: "There is some error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const userlogin = req.body;
    if (!userlogin.Username || !userlogin.Password) {
      return res.status(422).json({ message: "Please fill all the field" });
    }
    const userData = await userModel.findOne({ Username: userlogin.Username });
    if (!userData) {
      return res.status(404).json({ message: "Username is invalid" });
    }
    const userCompare = await bcrypt.compare(
      userlogin.Password,
      userData.Password
    );
    if (!userCompare) {
      return res.status(404).json({ message: "Password is invalid " });
    }
    const token = jwt.sign({ _id: userData._id }, "thisistoken");
    userData.tokens.push({ token });
    userData.lastlogin = new Date();
    await userData.save();
    (userData.tokens = []), (userData.Password = ""), (userData._id = "");
    res.status(200).json({
      message: "User login succesfully",
      token: token,
      user: userData,
    });
  } catch (error) {
    res.status(404).json({ error: "There is some error" });
  }
});

router.post("/updateuser", auth, async (req, res) => {
  const ruser = req.user;
  const duser = req.body;
  const validProperty = ["Username", "Emailid", "Password"];
  const property = Object.keys(duser);
  const rprope = property.filter((prope) => validProperty.includes(prope));
  if (rprope.length !== property.length) {
    return res.status(400).json({ error: "invalid feild" });
  }
  if (duser.Password) {
    const password = await bcrypt.hash(duser.Password, 8);
    duser.Password = password;
  }
  await userModel
    .findByIdAndUpdate(ruser._id, duser)
    .then((data) => {
      ruser.tokens = [];
      res.status(200).json({ userData: ruser });
    })
    .catch((err) => {
      res.status(400).send({ error: "invalid input" });
    });
});

router.post(
  "/updateavtar",
  auth,
  upload.single("updateAvtar"),
  async (req, res) => {
    console.log("in update avtar");
    try {
      const user = req.file.filename;
      const userData = req.user;
      if (!req.file.filename) {
        return res.status(400).json({ error: "please choose image" });
      }
      userData.avtar = req.file.filename;
      userData
        .save()
        .then(() => {
          res
            .status(200)
            .json({ message: "image upload succesfully", avtar: user });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      res.status(400).json({ error: "there is some error" });
    }
  }
);

router.get("/myprofile", auth, async (req, res) => {
  console.log("User", req.user);
  try {
    const User = req.user;
    User.tokens = [];
    if (User) {
      return res.status(200).json({ data: User });
    }
  } catch (error) {
    res.status(400).json({ error: "there is some error" });
  }
});

router.post("/followrequest", auth, async (req, res) => {
  try {
    const user = req.user;
    const sendID = req.body.ID;
    console.log(user._id, sendID);
    if (user._id == sendID) {
      console.log("both id are same");
      return res
        .status(208)
        .json({ message: "You are not sending request to you" });
    }
    if (!sendID) {
      return res.status(204).json({ message: "Please click on follow button" });
    }
    const Alreadysendeduser = user.Followers.find(
      (user) => user.request_by == sendID
    );
    if (Alreadysendeduser) {
      return res.status(208).json({ message: "You already send request" });
    }
    user.Followers.push({
      request_by: sendID,
      accept: 0,
    });
    user
      .save()
      .then(() => {
        res.status(200).json({ message: "Request send successfully" });
      })
      .catch(() => {
        res.status(400).send({ message: "There is some error" });
      });
  } catch (error) {
    res.status(400).send({ message: "There is some error" });
  }
});

router.post("/acceptrequest", auth, async (req, res) => {
  try {
    const user = req.user;
    let acceptID = req.body.ID;
    if (!acceptID) {
      return res.status(204).json({ message: "Please Click On accept button" });
    }
    const acceptUser = user.Followers.filter(
      (user) => user.request_by == acceptID
    );
    console.log("..........", acceptID);
    console.log("/././././", acceptUser);
    if (acceptUser.length === 0) {
      return res
        .status(208)
        .json({ message: "Provide user is not sended request to you" });
    }
    let index = user.Followers.findIndex((obj) => obj.request_by == acceptID);
    userModel.findOne({ Username: user.Username }).then((data) => {
      data.Followers.set(index, { request_by: acceptID, accept: 1 });
      data
        .save()
        .then((res) => {
          res.status(200).json({ message: "Your request", data: res });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (error) {
    res.status(400).send({ message: "There is some error" });
  }
});

router.get("/getrequest", auth, async (req, res) => {
  try {
    const user = req.user;
    await userModel
      .findById(user._id)
      .populate("Followers.request_by")
      .then(async (data) => {
        const UserData = await data.Followers.filter(
          (user) => user.accept === 0
        );
        UserData.map((obj) => {
          return (
            (obj.request_by.lastlogin = ""),
            (obj.request_by.Password = ""),
            (obj.request_by.tokens = [])
          );
        });
        res.status(200).json({ request: UserData });
      })
      .catch((err) => {
        res.status(400).json({ error: "There is some error" });
      });
  } catch (error) {
    res.status(400).send({ message: "There is some error" });
  }
});

router.get("/alluser", auth, async (req, res) => {
  try {
    userModel.find().then((data) => {
      // const userinfo = data.filter((user) => {
      //     user._id = "",
      //         user.Emailid = "",
      //         user.Password = "",
      //         user.tokens = []
      // })

      res.status(200).json({ userData: data });
    });
  } catch (error) {
    res.status(400).json({ error: "there is some error" });
  }
});

router.post("/logout", auth, async (req, res) => {
  const ruser = req.user;
  const token = req.token;
  const remainToken = await ruser.tokens.filter(
    (tokenobj) => tokenobj.token !== token
  );
  ruser.tokens = remainToken;
  ruser.save();
  res.status(200).send("logout success");
});

module.exports = router;
