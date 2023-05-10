const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/user");

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(422).json({
                success: false,
                errors: {
                    email: "This email has already been taken.",
                },
            });
        }

        const user = new User({
            email,
            password,
        });

        await user.save();
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
        });
    }
};

exports.login = async (req, res) => {
    const user = {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
    };
    const access_token = jwt.sign(user, config.SecretKey, { expiresIn: "2h" });
    return res.status(200).json({
        success: true,
        user,
        token: `jwt ${access_token}`,
    });
};
