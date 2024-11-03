const User = require("../models/users.js");
const Vendor = require("../models/vendors.js");
const bcrypt = require("bcryptjs")
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
configDotenv();
const generateToken = (userId) => {
  return jwt.sign({ userId }, "okjnlk", { expiresIn: "1h" });
};

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const existingVendor = await Vendor.findOne({ email });
    if (!existingVendor) {
      return res.status(400).json({ message: "Vendor not found. Please sign up." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, existingVendor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: existingVendor._id, email: existingVendor.email },
      process.env.JWT_SECRET, // Ensure you have a secret in your .env file
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send the response with the token
    res.status(200).json({
      message: "Login successful",
      token, // Return the JWT token
      vendor: {
        id: existingVendor._id,
        email: existingVendor.email,
        firstName: existingVendor.firstName,
        lastName: existingVendor.lastName,
        verified: existingVendor.verified
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const vendorSignup = async (req, res) => {
  try {
    const {
     
      confirmPassword,
      email,
      firstName,
      lastName,
      password,
      phone,
      verified
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await Vendor.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user/vendor
    const newUser = new Vendor({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      verified
    });

    const savedUser = await newUser.save();

    // Generate a JWT
    const token = jwt.sign(
      { userId: savedUser._id}, // Payload
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiry
    );

    // Send the response with the token
    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
      token, // Include token in the response
    });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const signup = async (req, res) => {
  try {
    const {
      confirmPassword,
      email,
      firstName,
      lastName,
      password,
      accountType,
      phone,
    } = req.body;
    let UserModel;

    if (accountType === "user") {
      UserModel = User;
    } else if (accountType === "vendor") {
      UserModel = Vendor;
    } else {
      return res.status(400).json({ error: "Invalid account type" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    } else {
      // const hashedPassword = crypto.SHA256(password).toString(crypto.enc.Hex);
      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        alphabets: false,
      });

      const newUser = new UserModel({
        firstName,
        lastName,
        email,
        // password: hashedPassword,
        password,
        accountType,
        confirmPassword,
        phone,
      });

      const savedUser = await newUser.save();

      res
        .status(201)
        .json({ message: "User created successfully", user: savedUser });
    }
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    let UserModel;

    if (accountType === "user") {
      UserModel = User;
    } else if (accountType === "vendor") {
      UserModel = Vendor;
    } else {
      return res.status(400).json({ error: "Invalid account type" });
    }

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordsMatch = password == existingUser.password;

    if (!passwordsMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(existingUser._id);

    const { firstName, lastName, _id } = existingUser;

    res.status(200).json({
      message: "Login successful",
      token,
      accountType,
      _id,
      user: {
        firstName,
        lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
  
    const { token } = req.body;

    
    const user = await User.findOne({ _id: token});

    if (!user) {
   
      return res.status(404).json({ error: "User not found" });
    }

    // If the user is found, send the user details to the frontend
    res.status(200).json(user);
  } catch (error) {
    // If an error occurs during the process, handle it
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const updateUser = async (req, res) => {
  try {
   
    const { _id, firstName, email, lastName, phone, addressLine1, addressLine2, state,city,country, postalCode,about, specialRequests ,profilePic} = req.body;


    const user = await User.findById(_id);

    // Update user details
    user.firstName = firstName;
    user.email = email;
    user.lastName = lastName;
    user.phone = phone;
    user.addressLine1 = addressLine1;
    user.addressLine2 = addressLine2;
    user.state = state;
    user.postalCode = postalCode;
    user.specialRequests = specialRequests;
    user.about = about;
    user.city = city;
    user.country = country;
    user.profilePic = profilePic;
    // Save the updated user details
    await user.save();

    res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = updateUser;

updateUser;
module.exports = {
  signup,
  login,
  updateUser,
  getUser,
  vendorSignup,
  vendorLogin
};
