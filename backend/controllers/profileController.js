const User = require('../models/User');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error('[Profile Controller Error - getProfile]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, education, careerInterests, skills } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    if (name) user.name = name.trim();
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const conflict = await User.findOne({ email: normalizedEmail });
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: 'Email address is already in use by another account.'
          });
        }
        user.email = normalizedEmail;
      }
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (education !== undefined) user.education = education.trim();
    if (careerInterests !== undefined && Array.isArray(careerInterests)) {
      user.careerInterests = careerInterests;
    }
    if (skills !== undefined && Array.isArray(skills)) {
      user.skills = skills;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        education: user.education,
        careerInterests: user.careerInterests,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error('[Profile Controller Error - updateProfile]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
