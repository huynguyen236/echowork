const router = require('express').Router();
const userController = require('../controllers/user.controller');
const auth     = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadAvatar, handleUpload } = require('../middlewares/upload.middleware');
const { updateProfileValidation } = require('../validations/user.validation');

// All user routes require authentication
router.use(auth);

// GET  /api/users/profile
router.get('/profile', userController.getProfile);

// PUT  /api/users/profile  (optional avatar file)
// handleUpload wraps multer to return clean 400 JSON errors instead of throwing
router.put(
  '/profile',
  handleUpload(uploadAvatar.single('avatar')),
  updateProfileValidation,
  validate,
  userController.updateProfile
);

module.exports = router;
