const User = require("../models/users.js");
const Vendor = require("../models/vendors.js");
const bcrypt = require("bcryptjs")
const Cart = require('../models/cart');
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const axios = require('axios');
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
configDotenv();


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
    const generateNumericOTP = (length) => {
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < length; i++) {
          otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
  };
  
  const otp = generateNumericOTP(6);

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
    const { email, otp, phone, name,userTempId } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Debugging: Log OTP values and lengths
  

    // Trim and normalize both values to avoid any hidden discrepancies
    const dbOtp = user.otp.trim().normalize();
    const inputOtp = otp.trim().normalize();

    // Compare OTPs
    if (dbOtp !== inputOtp) {
      user.isVerified = false;
      return res.status(400).json({ error: "Invalid OTP" });
    }
    user.isVerified = true;
    user.otp = null;
    console.log("user",user._id)
    await user.save();
    if (userTempId) {
      const cart = await Cart.findOne({ userTempId: userTempId }).sort({ addedAt: -1 })
      console.log("cart",cart)
      if (cart) {
        cart.userId = user._id; 
        await cart.save();
        console.log("Cart updated with user ID:", cart);
      } else {
        console.log("No cart found for the provided tempId.");
      }
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '72h' } // Token expires in 72 hours
    );

    // Aisensy payload for WhatsApp message
    const aisensyPayload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: "welcome",
      destination: phone,
      userName: "Devsthan Expert",
      templateParams: [name],
      source: "whatsapp_inquiry_tour IMAGE",
      buttons: [],
      carouselCards: [],
      location: {},
      paramsFallbackValue: {}
    };

    // Send WhatsApp message using Aisensy API
    try {
      const aisensyResponse = await axios.post(
        'https://backend.aisensy.com/campaign/t1/api/v2',
        aisensyPayload,
        {
          headers: {
            'Authorization': `Bearer ${aisensyPayload.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('WhatsApp message sent via Aisensy:', aisensyResponse.data);
    } catch (aisensyError) {
      console.error("Aisensy API Error:", aisensyError.response?.data || aisensyError.message);
    }

    // Return success response with user details and token
    res.status(200).json({
      success: true,
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
    console.error("Server error:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const login = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    // Generate OTP
    const generateNumericOTP = (length) => {
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    };

    const otp = generateNumericOTP(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    if (!user) {
      // Create new user if email doesn't exist
      user = new User({
        email,
        otp,
        otpExpiresAt,
      });
      await user.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Devsthan Expert - Verify Your Account",
        text: `Hello,\n\nYour account has been created. To verify your account, please use the following OTP:\n\nOTP: ${otp}\n\nThis OTP will expire in 10 minutes. Please do not share this OTP with anyone.\n\nBest regards,\nDevsthan Expert`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Error sending OTP email." });
        }
        console.log("Email sent:", info.response);
      });

      return res.status(201).json({
        success: true,
        message: "Account created and OTP sent. Please verify to continue.",
        email,
      });
    } else {
      // If user exists, update OTP and expiration
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Login - OTP",
        text: `Hello ${user.name},\n\nTo verify your login, please use the following OTP:\n\nOTP: ${otp}\n\nThis OTP will expire in 10 minutes. Please do not share this OTP with anyone.\n\nBest regards,\nDevsthan Expert`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Error sending OTP email." });
        }
        console.log("Email sent:", info.response);
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent. Please verify to continue.",
        email,
      });
    }
  } catch (error) {
    console.error(error);
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
