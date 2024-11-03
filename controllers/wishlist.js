const User = require("../models/users");
const Tour = require("../models/tour");
const addToWishlist = async (req, res) => {
  try {
    const { uuid, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tourExists = user.wishlist.some((tour) => {
      if (typeof tour === "string") {
        return tour === uuid;
      } else {
        return tour.uuid === uuid;
      } 
    });

    if (tourExists) {
      return res
        .status(400)
        .json({ message: "Tour already exists in the wishlist" });
    }

    // Add the tour to the user's wishlist
    user.wishlist.push(uuid);
    await user.save();

    res.status(200).json({ message: "Tour added to wishlist" });
  } catch (error) {
    console.error("Error adding tour to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const wishlistWithTours = await Promise.all(
      user.wishlist.map(async (uuid) => {
        const tour = await Tour.findOne({ uuid });
        return tour; 
      })
    );
    res.status(200).json({ wishlist: wishlistWithTours });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, uuid } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlist = user.wishlist.filter((item) => item !== uuid);
    await user.save();

    res.status(200).json({ message: "Tour removed from wishlist" });
  } catch (error) {
    console.error("Error removing tour from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
