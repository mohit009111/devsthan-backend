const Razorpay = require("razorpay");
require("dotenv").config();
const Booking = require("../models/userBooking");

const instance = new Razorpay({
  key_id: "rzp_test_51M4AB2hSU08Ih",
  key_secret: "njtg5niFstEhGvYxIqzlr6uf",
});

const checkout = async (req, res) => {
  const { price } = req.body;

  try {
    const options = {
      amount: Number(price * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const crypto = require("crypto");
const secret = "njtg5niFstEhGvYxIqzlr6uf";

const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("Payment verification successful");
      res.status(200).json({
        message: "Payment verification successful",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      console.log("Payment verification failed");
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userBooking = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      userDetails,
      totalPrice,
      paymentId,
      addressLine1,
      addressLine2,
      state,
      postalCode,
      specialRequests,
      bookedTour,
      vendorId,
      status,
      tourName,
    } = req.body;

    const newUserBooking = new Booking({
      orderId,
      userId,
      userDetails,
      totalPrice,
      paymentId,
      addressLine1,
      addressLine2,
      state,
      postalCode,
      specialRequests,
      bookedTour,
      vendorId,
      status,
      tourName,
    });

    const newBooking = await newUserBooking.save();

    res
      .status(200)
      .json({ message: "User booking details saved successfully" });
  } catch (error) {
    console.error("Error saving user booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getBookedUserDetails = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const bookedUserDetails = await Booking.findOne({ paymentId });

    if (!bookedUserDetails) {
      return res.status(404).json({
        error: "No booking details found for the provided payment ID",
      });
    }

    res.status(200).json({ bookedUserDetails });
  } catch (error) {
    console.error("Error fetching user booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getBookedToursByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const bookedTours = await Booking.find({ vendorId: vendorId });
    res.status(200).json({ bookedTours });
  } catch (error) {
    console.error("Error fetching user booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getBookedToursByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookedTours = await Booking.find({ userId: userId });
    res.status(200).json({ bookedTours });
  } catch (error) {
    console.error("Error fetching user booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const updateBookedToursByVendor = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

   
    const updatedTour = await Booking.findOneAndUpdate(
      { orderId: orderId }, 
      { status: newStatus }, 
     
    );

    if (!updatedTour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    console.log(`Status of tour with ID ${orderId} updated to ${newStatus}`);

    res.status(200).json({ message: 'Tour status updated successfully', updatedTour });
  } catch (error) {
    console.error('Error updating tour status:', error);
    res.status(500).json({ error: 'Failed to update tour status' });
  }
};

module.exports = updateBookedToursByVendor;


module.exports = {
  checkout,
  paymentVerification,
  userBooking,
  getBookedUserDetails,
  getBookedToursByVendor,
  getBookedToursByUser,
  updateBookedToursByVendor
};
