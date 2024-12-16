const CustomizedQuery = require('../models/customizedQuery.js');
const axios = require('axios');
// Function to create a new category
const createCustomizedQuesry = async (req, res) => {
    
    try {
        const { name, email, mobileNumber, query, noOfAdult, noOfChild, uuid } = req.body;

        // Validate input
        if (!name || !email || !mobileNumber || !query || !noOfAdult || !noOfChild || !uuid) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newQuery = new CustomizedQuery({
            name,
            email,
            mobileNumber,
            query,
            noOfAdult,
            noOfChild,
            uuid
        });

        await newQuery.save();
        res.status(201).json({ success: true, message: 'Query submitted successfully', data: newQuery });
            const aisensyPayload = {
              apiKey: process.env.AISENSY_API_KEY,
              campaignName: "custom tour",
              destination: mobileNumber,
              userName: "Devsthan Expert",
        
              templateParams: [
                name
        
              ]
              ,
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
const getCustomizedQuesry = async (req, res) => {
    try {
        const queries = await CustomizedQuery.find().sort({ createdAt: -1 });
        res.status(200).json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch queries' });
    }

}
const deleteCustomizedQuesry = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuery = await CustomizedQuery.findByIdAndDelete(id);
        if (!deletedQuery) {
          return res.status(404).json({ message: 'Query not found' });
        }
        res.json({ message: 'Query deleted successfully', deletedQuery });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }

}
const editCustomizedQuesry = async (req, res) => {
    try {
        const { id } = req.params;
        const { read } = req.body;
  
        const updatedQuery = await CustomizedQuery.findByIdAndUpdate(
          id,
          { read: read },
          { new: true } // Return the updated document
        );
    
        if (!updatedQuery) {
          return res.status(404).json({ success: false, message: 'Query not found' });
        }
    
        res.status(200).json({ success: true, data: updatedQuery });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
      }

}



module.exports = {
    createCustomizedQuesry,
    getCustomizedQuesry,
    deleteCustomizedQuesry,
    editCustomizedQuesry
};
