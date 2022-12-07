const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
const cookieParser = require("cookie-parser");

require("../db/conn");
const User = require("../model/userSchema");

router.use(cookieParser());

router.get("/", (req, res) => {
  res.send("Hello From server");
});

// About us
router.get("/about", authenticate, (req, res) => {
  console.log("Hello About");
  res.send(req.rootUser);
});

// Contact us
router.post("/contact", authenticate, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      console.log("error in contact form");
      return res.json({ error: "Plz fill the contact form" });
    }

    const userContact = await User.findOne({ _id: req.userID });

    if (userContact) {
      const userMessage = await userContact.addMessage(
        name,
        email,
        phone,
        message
      );
      await userContact.save();
      res.status(201).json({ message: "User contact successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

// using promise

// router.post('/register',(req,res) => {
//     const {name, email, phone, work, password, cpassword} = req.body

//     if(!name || !email || !phone || !work || !password || !cpassword)
//     {
//         return res.status(422).json({error : 'Plz fill the fields properly'})
//     }

//     User.findOne({email : email})
//     .then((userExist) => {
//         if(userExist)
//         {
//             return res.status(422).json({error : 'Email already Exist'})
//         }
//         const user = new User({name, email, phone, work, password, cpassword})

//         user.save().then(() => {
//         res.status(201).json({message : 'User Registered Successfully'})
//        }).catch((err) => {
//         res.status(500).json({error : "Failed to Register"})
//     })
//     }).catch((err) => {
//         console.log(err);
//    })
// })

// using async await
// Register
router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "Plz fill the fields properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "Password are not matching" });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });
      await user.save();
      res.status(201).json({ message: "User Registered Successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

// login router

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Plz fill the data" });
    }

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      const token = await userLogin.generateAuthToken();

      // store token in cookie
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });

      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credientials" });
      } else {
        res.json({ message: "User Signin successful" });
      }
    } else {
      res.status(400).json({ error: "Invalid Credientials" });
    }
  } catch (error) {
    console.log(error);
  }
});

// get user data for contact and home page
router.get("/getdata", authenticate, (req, res) => {
  console.log("hello getData");
  res.send(req.rootUser);
  // console.log(req.rootUser);
});

router.get("/signup", (req, res) => {
  res.send("Hello From signup");
});

// logout
router.get("/logout", authenticate, (req, res) => {
  console.log("hello logout");
  res.clearCookie("jwtoken");
  res.status(200).send("User logout");
  // console.log(req.rootUser);
});

module.exports = router;
