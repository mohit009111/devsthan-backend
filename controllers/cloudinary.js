const multer = require('multer');

// Configure multer to store files in the 'uploads' directory


const imageUpload = async (req, res) => {
  try {
    console.log(req.file)

  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

module.exports = {
  imageUpload
};
