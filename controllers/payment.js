// Import necessary modules
const Razorpay = require('razorpay');
const axios = require('axios');

const Tour = require('../models/tour');
const Users = require('../models/users');
const crypto = require('crypto');
const Orders = require('../models/orders')
const Cart = require('../models/cart');
require('dotenv').config();
const nodemailer = require("nodemailer");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY, 
    key_secret: process.env.RAZORPAY_SECRET 
});
console.log(process.env.ADMIN_EMAIL)
const sendEmail = async (order, actionType) => {
    let subject, htmlContent;
  
    if (actionType === 'Approved') {
      subject = 'Tour Confirmation';
      htmlContent = `
        <h2>Tour Confirmed</h2>
        <p>Dear ${order.username},</p>
        <p>Your tour has been successfully confirmed!</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Tour ID:</strong> ${order.tourId}</li>
          <li><strong>Category:</strong> ${order.category}</li>
          <li><strong>Total Price:</strong> $${order.totalPrice}</li>
          <li><strong>Rooms:</strong>
            <ul>
              ${order.rooms
                .map(
                  (room) =>
                    `<li>Room ${room.room} - Adults: ${room.adults}, Children: ${room.children}</li>`
                )
                .join('')}
            </ul>
          </li>
        </ul>
        <p>Thank you for choosing our services!</p>
      `;
    } else if (actionType === 'Rejected') {
      subject = 'Tour Rejection';
      htmlContent = `
        <h2>Tour Rejected</h2>
        <p>Dear ${order.username},</p>
        <p>We regret to inform you that your tour has been rejected due to some issues.</p>
        <p>If you have any questions, please contact us for further details.</p>
        <p>Thank you for understanding.</p>
      `;
    }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.email,
      subject,
      html: htmlContent,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`${actionType} email sent successfully`);
    } catch (error) {
      console.error(`Error sending ${actionType} email:`, error);
    }
  };
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
        const price = adults * pricePerPerson + children * childPrice;
        const gst = price * 0.05;
        totalPrice=price+gst 

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
        const { tourId, userId, category, address, mobile, email, rooms, username,date } = req.body;
        console.log(email)

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
        const price = adults * pricePerPerson + children * childPrice;
        const gst = price * 0.05;
        totalPrice=price+gst 

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

        const userMailOptions  = {
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

        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, // Replace with admin email address
            subject: "New Order Placed",
            text: `Dear Admin,\n\nA new order has been placed with the following details:\n\n- Username: ${username}\n- User ID: ${userId}\n- Tour: ${tour.name}\n- Category: ${category}\n- Total Price: $${totalPrice}\n- Email: ${email}\n- Mobile: ${mobile}\n- Address: ${address}\n\nPlease review the order and take the necessary action.\n\nBest regards,\nDevsthan Expert System`,
        };

        // Send both emails
        if (email) {
            await transporter.sendMail(userMailOptions);
        } else {
            console.error("User email is missing. Skipping user email notification.");
        }
        
        if (process.env.ADMIN_EMAIL) {
            await transporter.sendMail(adminMailOptions);
        } else {
            console.error("Admin email is missing. Skipping admin email notification.");
        }
     
  const aisensyPayload = {
              apiKey: process.env.AISENSY_API_KEY,
              campaignName: "orderplaced",
              destination: mobile,
              userName: "Devsthan Expert",
        
              templateParams: [
                username,
                tour.name,
                tour.name,
                `${tour.duration} days / ${tour.duration - 1} nights`,
                date,
                tour.location

              ]
              ,
              media: {
                type: "image", // Specify the media type
                url: tour?.bannerImage || "", // Publicly accessible URL of the image
                filename: "banner.jpg", // Include a filename if required by the API
              },
              source: "whatsapp_inquiry_tour IMAGE",
              buttons: [],
              carouselCards: [],
              location: {},
              paramsFallbackValue: {}
            };
        
            // Send WhatsApp message using Aisensy API
            const aisensyResponse = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', aisensyPayload, {
              headers: {
                'Authorization': `Bearer ${aisensyPayload.apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('WhatsApp message sent via Aisensy:', aisensyResponse.data);
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

const updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

  // Validation
  if (!orderId || !status) {
    return res.status(400).json({ message: 'Order ID and status are required' });
  }

  try {
    // Find and update the order
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Approved' || status === 'Rejected') {
        await sendEmail(updatedOrder, status);
      }
    res.status(200).json({
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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

module.exports = { paymentCalculate, verifyPayment, createOrder ,getOrder,updateOrderStatus};
