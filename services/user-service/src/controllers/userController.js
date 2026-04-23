const User    = require('../models/User');
const Profile = require('../models/Profile');

// GET /users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const profile = await Profile.findOne({ userId: user._id });
    res.json({ success: true, data: { user, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /users/:id/profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, avatar, website, skills } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      { bio, avatar, website, skills },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /users/verify-token  (utilisé par les autres services)
exports.verifyToken = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, valid: false });
    }
    res.json({ success: true, valid: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};