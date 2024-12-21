const WhyChoose = require('../models/whyChoose');

// Create
const createWhyChoose = async (req, res) => {
    try {
        const { title, description, bannerImage, uuid } = req.body;


        const whyChoose = new WhyChoose({ bannerImage, title, description, uuid });
        await whyChoose.save();

        res.status(201).json({ message: 'Why Choose Us created successfully.', whyChoose });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Why Choose Us section.', error });
        console.log(error)
    }
};

// Update
const updateWhyChoose = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, bannerImage } = req.body;


        const updatedData = { title, description, bannerImage };


        const updatedWhyChoose = await WhyChoose.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedWhyChoose) {
            return res.status(404).json({ message: 'Why Choose Us not found.' });
        }

        res.status(200).json({ message: 'Why Choose Us updated successfully.', updatedWhyChoose });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Why Choose Us section.', error });
    }
};


const deleteWhyChoose = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedWhyChoose = await WhyChoose.findByIdAndDelete(id);

        if (!deletedWhyChoose) {
            return res.status(404).json({ message: 'Why Choose Us not found.' });
        }

        res.status(200).json({ message: 'Why Choose Us deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Why Choose Us section.', error });
    }
};

const getAllWhyChoose = async (req, res) => {
    try {

        const whyChooses = await WhyChoose.find();

        res.status(200).json({ status: "success", data: whyChooses });
    } catch (error) {
        console.error("Error getting why choose:", error);
        res.status(500).json({ status: "error", message: "Error getting why choose", error: error.message });
    }
};

module.exports = {
    deleteWhyChoose,
    updateWhyChoose,
    createWhyChoose,
    getAllWhyChoose
};
