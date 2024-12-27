const Inquiry = require('../models/inquiry');
const Contact = require('../models/contact');
const axios = require('axios');
const Tour = require('../models/tour')
require('dotenv').config();
const nodemailer = require("nodemailer");
const { updateTour } = require('./tour');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createInquiryOrContact = async (req, res) => {
  try {
    const { fullName, email, message, phone, uuid } = req.body;



    if (!fullName || !email || !message || !phone) {
      return res.status(400).json({ error: 'Full Name, Email, Message, and Phone are required' });
    }

    let savedData;
    let tour = null;

    if (uuid) {
      // Fetch tour by UUID (assuming the model is called Tour)
      tour = await Tour.findOne({ uuid: uuid }); // Use findOne to get a single document

      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }

      // Save inquiry or contact data
      savedData = await Inquiry.create({ fullName, email, message, phone, uuid });
    } else {
      savedData = await Contact.create({ fullName, email, message, phone });
    }

    // Prepare dynamic template params


    // Email options
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for your inquiry/contact!",
      text: `Hi ${fullName},\n\nThank you for reaching out! We have received your message: "${message}".\n\nWe'll get back to you shortly.\n\nBest regards,\nDevsthan Expert`
    };
  
    // Admin email
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Admin email address from environment variable
      subject: "New Inquiry/Contact Submission",
      text: `Dear Admin,\n\nYou have received a new inquiry/contact submission:\n\nName: ${fullName}\nEmail: ${email}\nMessage: "${message}"\n\nPlease follow up with the user promptly.\n\nBest regards,\nYour Website`
    };
  
    // Send email to user
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to user:", error);
        return res.status(500).json({ error: "Error sending email to user" });
      }
      console.log("User email sent:", info.response);
  
      // Send email to admin
      transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to admin:", error);
          return res.status(500).json({ error: "Error sending email to admin" });
        }
        console.log("Admin email sent:", info.response);
        return res.status(200).json({ message: "Emails sent successfully" });
      });
    });
    

if(uuid){
 const aisensyPayload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: "contact",
      destination: phone,
      userName: "Devsthan Expert",

      templateParams: [
        fullName

      ]
      ,
      source: "whatsapp_inquiry_tour IMAGE",
      media: {
        type: "image", // Specify the media type
        url: tour?.bannerImage || "", // Publicly accessible URL of the image
        filename: "banner.jpg", // Include a filename if required by the API
      },
      buttons: [],
      carouselCards: [],
      location: {},
      paramsFallbackValue: {}
    };
    const aisensyResponse = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', aisensyPayload, {
      headers: {
        'Authorization': `Bearer ${aisensyPayload.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('WhatsApp message sent via Aisensy:', aisensyResponse.data);

}else{
  const aisensyPayload = {
    apiKey: process.env.AISENSY_API_KEY,
    campaignName: "contactus",
    destination: phone,
    userName: "Devsthan Expert",

    templateParams: [
      fullName

    ]
    ,
    source: "whatsapp_inquiry_tour IMAGE",
    media: {
    },
    buttons: [],
    carouselCards: [],
    location: {},
    paramsFallbackValue: {}
  };
  const aisensyResponse = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', aisensyPayload, {
    headers: {
      'Authorization': `Bearer ${aisensyPayload.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('WhatsApp message sent via Aisensy:', aisensyResponse.data);

}
    // Aisensy WhatsApp API Payload
   
    // Send WhatsApp message using Aisensy API
  

    // Return saved data and tour information
    res.status(201).json({ success: true, data: savedData, tour });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markAsReadOrUnread = async (req, res) => {
  try {
    const { id, readStatus } = req.body;  // Get the id and readStatus from request body

    if (typeof readStatus !== 'boolean') {
      return res.status(400).json({ error: 'readStatus must be a boolean' });
    }

    let updatedData;

    // Check if the ID belongs to an Inquiry or Contact and update accordingly
    if (id) {
      // Check Inquiry collection first
      updatedData = await Inquiry.findByIdAndUpdate(
        id,
        { read: readStatus },
        { new: true }
      );

      if (!updatedData) {
        // If not found in Inquiry, try Contact
        updatedData = await Contact.findByIdAndUpdate(
          id,
          { read: readStatus },
          { new: true }
        );
      }

      if (!updatedData) {
        return res.status(404).json({ error: 'Inquiry or Contact not found' });
      }

      // Return the updated data
      res.status(200).json({ success: true, data: updatedData });
    } else {
      return res.status(400).json({ error: 'ID is required' });
    }
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    // Fetch the tour name for each inquiry by uuid
    const formattedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
      
        const tour = await Tour.findOne({ uuid: inquiry.uuid });
        const tourName = tour ? tour.name : 'Unknown Tour';  // Default to 'Unknown Tour' if tour not found
     
        return {
          ...inquiry.toObject(),
          createdAt: new Date(inquiry.createdAt).toLocaleString(),
          tourName,
        };
      })
    );

    res.status(200).json({ success: true, data: formattedInquiries });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    // Format the createdAt field for each contact
    const formattedContacts = contacts.map(contact => ({
      ...contact.toObject(),
      createdAt: new Date(contact.createdAt).toLocaleString()
    }));

    res.status(200).json({ success: true, data: formattedContacts });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createInquiryOrContact,
  getAllInquiries,
  getAllContacts,
  markAsReadOrUnread
};
