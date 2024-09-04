const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// Passport local strategy for username and password login
passport.use(
  new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      // Find the user by username
      const user = await User.findOne({ username });

      // If no user found, return an error
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Match password
      if (password !== user.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // If the user is found and password is correct, return the user object
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user to store user id in the session
passport.serializeUser((user, done) => {
    done(null, { id: user._id, username: user.username, role: user.role, groupId: user.group });
  });

// Deserialize user to retrieve user object from the session data
passport.deserializeUser(async (userData, done) => {
    try {
      const user = await User.findById(userData.id).populate('group');
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        username: user.username,
        groupId: user.group._id, 
        role: user.role,
      });
    } catch (err) { 
      done(err);
    }
  });

module.exports = passport;
