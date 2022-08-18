const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/AuthController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/UserController');

//signup, login, resetpassword
router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
