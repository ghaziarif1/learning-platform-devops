const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { getRedisClient } = require('../config/redis');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
    }

    const user = await User.create({ email, password, firstName, lastName, role });
    await Profile.create({ userId: user._id });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        token,
        user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    // Cache dans Redis
    const redis = getRedisClient();
    if (redis) {
      await redis.setEx(`user:${user._id}`, 3600, JSON.stringify({
        id: user._id, email: user.email, role: user.role
      }));
    }

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: { id: req.user._id, email: req.user.email, firstName: req.user.firstName, lastName: req.user.lastName, role: req.user.role }
    }
  });
};

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    const redis = getRedisClient();
    if (redis) await redis.del(`user:${req.user._id}`);
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};