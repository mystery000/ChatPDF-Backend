
const jwt = require('jsonwebtoken');

const config = require('../config');
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(422).json({
        success: false,
        errors: {
          email: 'This email has already been taken.'
        }
      });
    }

    const user = new User({
      email,
      password
    });

    await user.save();

    return res.json({
      success: true,
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error
    });
  }
}

exports.login = async (req, res) => {

  const user = { id: req.user._id, email: req.user.email };
  const token = jwt.sign(user, config.SecretKey);
  return res.json({
    success: true,
    user,
    token: `jwt ${token}`
  });

}