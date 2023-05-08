const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const config = require('./index');

const User = require('../models/user');

const loginOptions = {
  usernameField: 'email',
  passwordField: 'password'
};
const jwtLogin = new localStrategy(
  loginOptions,
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const validate = await user.isValidPassword(password);

      if (!validate) {
        return done(null, false, { message: 'Wrong Password' });
      }

      return done(null, user, { message: 'Logged in Successfully' });
    } catch (error) {
      return done(error);
    }
  }
);

const authOptions = {
  secretOrKey: config.SecretKey,
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt')
};
const jwtAuth = new JWTstrategy(
  authOptions,
  (jwt_payload, done) => {
    User.findById(jwt_payload.id, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }
);

passport.use('login', jwtLogin);
passport.use('jwt', jwtAuth);