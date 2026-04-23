const express = require('express');
const router  = express.Router();
const { getUserById, updateProfile, getAllUsers, verifyToken } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',              protect, authorize('admin'), getAllUsers);
router.get('/:id',           protect, getUserById);
router.put('/:id/profile',   protect, updateProfile);
router.post('/verify-token', verifyToken);

module.exports = router;