// Import necessary modules
const Razorpay = require('razorpay');

const Tour = require('../models/tour');
const Users = require('../models/users');
const crypto = require('crypto');
const Orders = require('../models/orders')
const Cart = require('../models/cart');
require('dotenv').config();
const nodemailer = require("nodemailer");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY, // Replace with your Razorpay Key ID
    key_secret: process.env.RAZORPAY_SECRET // Replace with your Razorpay Key Secret
});
console.log(process.env.EMAIL_PASS)
// POST API to create an order
const paymentCalculate = async (req, res) => {
    try {

        const { tourId, userId, category } = req.body

        const user = userId.id
        const cart = await Cart.findOne({ user }).sort({ addedAt: -1 });
        const adults = cart.adults
        const children = cart.children

        const tour = await Tour.findOne({ uuid: tourId });
        if (!tour) {
            return res.status(404).json({ success: false, error: "Tour not found" });
        }

        let selectedPrice = null;
        let selectedRooms = null;
        const totalPeople = adults + children;
        const childPriceFactor = 0.5;
        const categoryField = category || "standardDetails";

        if (tour?.[categoryField]?.pricing) {
            for (const tier of tour[categoryField].pricing) {
                if (totalPeople <= tier.person) {
                    selectedPrice = tier.price;
                    selectedRooms = tier.rooms; // Extract rooms from the pricing tier
                    break;
                }
            }
        } else {
            console.error(
                `Pricing information for category "${categoryField}" is not available.`
            );
        }

        if (!selectedPrice) {
            return res.status(400).json({
                success: false,
                message: `Pricing not available for ${categoryField} category.`,
            });
        }

        const pricePerPerson = selectedPrice / totalPeople;
        const childPrice = pricePerPerson * childPriceFactor;
        const totalPrice = adults * pricePerPerson + children * childPrice;


        const options = {
            amount: Math.round(totalPrice) * 100, 
            currency: "INR",
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        // Respond with the created order
        return res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};



const createOrder = async (req, res) => {
    try {
        // Extract data from request body
        const { tourId, userId, category, address, mobile, email, rooms, username } = req.body;

        const user = await Users.findOne({ userId });

        const cart = await Cart.findOne({ userId }).sort({ addedAt: -1 });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Fetch the tour details using the tourId
        const tour = await Tour.findOne({ uuid: tourId });
        if (!tour) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }

        // Check if user already has a booking for this tour
        const existingOrder = await Orders.findOne({
            userId: userId,
            tourId: tourId,
            paymentStatus: { $ne: "failed" },
        });
        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: "You have already booked this tour.",
            });
        }

        const { adults, children } = cart;
        const totalPeople = adults + children;
        const childPriceFactor = 0.5;
        const categoryField = category || "standardDetails";

        let selectedPrice = null;
        let selectedRooms = null;

        // Get the pricing details for the selected category
        if (tour?.[categoryField]?.pricing) {
            for (const tier of tour[categoryField].pricing) {
                if (totalPeople <= tier.person) {
                    selectedPrice = tier.price;
                    selectedRooms = tier.rooms;
                    break;
                }
            }
        }

        if (!selectedPrice) {
            return res.status(400).json({
                success: false,
                message: `Pricing not available for ${categoryField} category.`,
            });
        }

        const pricePerPerson = selectedPrice / totalPeople;
        const childPrice = pricePerPerson * childPriceFactor;
        const totalPrice = adults * pricePerPerson + children * childPrice;

        // Create a new order and save it to the database
        const order = new Orders({
            username,
            userId,
            tourId,
            category,
            totalPrice,
            address,
            rooms,
            mobile,
            email,
            status: "pending",
            paymentStatus: "pending",
            specialRequests: "",
        });
        await order.save();

        // Email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Order is Placed - Awaiting Confirmation",
            html: `
                <h2>Thank you for your order, ${username}!</h2>
                <p>Your order has been placed and is waiting for confirmation. Below are your order details:</p>
                <h3>Order Details:</h3>
                <ul>
                    <li><strong>Tour Name:</strong> ${tour.name}</li>
                    <li><strong>Category:</strong> ${category}</li>
                    <li><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</li>
                    
                    <li><strong>Address:</strong> ${address}</li>
                    <li><strong>Mobile:</strong> ${mobile}</li>
                </ul>
                <p>We will notify you once your order is confirmed.</p>
                <p>If you have any questions, feel free to contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
                <p>Thank you for choosing us!</p>
                <br>
                <p>Best regards,</p>
                <p><strong>Devsthan Expert Team</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);

        // Respond with the created order
        return res.status(201).json({
            success: true,
            message: "Order created successfully. A confirmation email has been sent to your email address.",
            order,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

const getOrder = async (req, res) => {
    try {
     
      const orders = await Orders.find({}).sort({ createdAt: -1 });
  
     
      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      // Handle any errors during the fetching process
      console.error("Error fetching orders:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders. Please try again later.",
      });
    }
  };
  
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const key_secret = process.env.RAZORPAY_SECRET;
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
            });
        } else {
            // Signature mismatch
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// Export the function for use in routes

module.exports = { paymentCalculate, verifyPayment, createOrder ,getOrder};
