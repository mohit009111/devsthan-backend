const User = require("../models/users.js");
const Vendor = require("../models/vendors.js");
const bcrypt = require("bcryptjs")
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
configDotenv();
const generateToken = (userId) => {
  return jwt.sign({ userId }, "okjnlk", { expiresIn: "1h" });
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: false,
    });

    // Save user with OTP and mark as unverified
    const newUser = new User({
      name,
      email,
      password, // Ideally, hash this password before saving
      phone,
      otp,
      isVerified: false,
    });

    await newUser.save();

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account - OTP",
      text: `Hello ${name},\n\nThank you for signing up on our platform. To verify your account, please use the following OTP:\n\nOTP: ${otp}\n\nThis OTP will expire in 10 minutes. Please do not share this OTP with anyone.\n\nBest regards,\nDevsthan Expert`,
    };

    // Send email with OTP
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending OTP email." });
      }
      console.log("Email sent:", info.response);
    });

    res.status(201).json({
      success:true,
      message: "User registered successfully. Please verify OTP sent to your email.",
      email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    res.status(500).json({ success:false,error: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
console.log(email,otp)
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the provided OTP matches the stored OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark the user as verified and clear the OTP
    user.isVerified = true;
    user.otp = null; // Clear OTP after verification
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return user details and token
    res.status(200).json({
      success:true,
      message: "OTP verified successfully. Redirecting to home page.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    // console.error("OTP verification error:", error);
    res.status(500).json({ success:false,error: "Internal server error" });
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
  verifyOtp,
  getUser,
 
};
