const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/AuthController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/UserController');

//signup, login, resetpassword
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updatePassword);
router.route('/updateMe').patch(protect, updateMe);
router.route('/deleteMe').delete(protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
