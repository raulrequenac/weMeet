const passport = require('passport')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/user.model');

passport.use('google-auth',
  new GoogleStrategy(
    {
      clientID: "975498984902-l4n9gq1js31ps89v3qbjrc9lnf96fdkc.apps.googleusercontent.com",
      clientSecret: "GFGNl80BPAW3m_nA5S3TWA2d",
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      // console.log("Google account details:", profile);

      User.findOne({ social: { google: profile.id }})
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          const newUser = new User({
            name: profile.displayName,
            images: profile.photos.map(image => image.value),
            email: profile.emails[0].value,
            validated: true,
            password: profile.provider + Math.random().toString(36).substring(7),
            social: {
              [profile.provider.toLowerCase()]: profile.id
            }
          })

          newUser.save()
            .then(savedUser => {
              done(null, savedUser)
            })
            .catch(err => done(err));

        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
)

module.exports = passport.initialize();

