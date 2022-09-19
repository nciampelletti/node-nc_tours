const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/AuthController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/UserController');

const { getMyTours } = require('../controllers/BookingController');

//signup, login, resetpassword
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);

//this will protect all routes that come after this point
router.use(protect);

router.route('/updateMyPassword').patch(updatePassword); //protected

router.route('/me').get(getMe, getUser); //protected

//will also update phone on UpdateMe route
//use multer middlerwear
router.route('/updateMe').patch(uploadUserPhoto, resizeUserPhoto, updateMe); //protected
router.route('/deleteMe').delete(deleteMe); //protected

router.route('/mytours').get(getMyTours); //protected

//this will protect all routes that come after this point and restricts only to Admin
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
