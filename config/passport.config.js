const passport = require('passport')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/user.model');
const Company = require('../models/company.model');

passport.use('google-users',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/login/google/users/callback"
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
            age: profile.birthday,
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

passport.use('google-companies',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/login/google/companies/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      // console.log("Google account details:", profile);

      Company.findOne({ social: { google: profile.id }})
        .then(company => {
          if (company) {
            done(null, company);
            return;
          }

          const newUser = new Company({
            name: profile.displayName,
            logo: profile.photos.map(image => image.value),
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
        .catch(err => done(err)); // closes Company.findOne()
    }
  )
)

module.exports = passport.initialize();

