const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });
const jwtLogin = passport.authenticate('login', { session: false });

module.exports = {
  jwtAuth,
  jwtLogin
}