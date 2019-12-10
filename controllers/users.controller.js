const mongoose = require('mongoose');
const User = require('../models/user.model');
const mailer = require('../config/mailer.config');
const passport = require('passport')

module.exports.new = (_, res) => {
  res.render('users/new', {
    user: new User()
  })
}

module.exports.create = (req, res, next) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    bio: req.body.bio,
    images: req.files.map(file => file.url)
  })

  user.save()
    .then((user) => {
      mailer.sendValidateEmail(user)
      res.redirect('/')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/new', {
          user,
          error: error.errors
        })
      } else if (error.code === 11000) {
        res.render('/', {
          user: {
            ...user,
            password: null
          },
          genericError: 'User exists'
        })
      } else {
        next(error);
      }
    })
}

module.exports.login = (req, res, next) => {
  res.render('users/login')
}

module.exports.doLogin = (req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.render('users/login', {user:req.body})
  } 
  User.findOne( {email:email, validated:true})
    .then(user => {
      if (!user) {
        res.render('users/login', {user:req.body})
      } else {
        return user.checkPassword (password)
          .then (match => {
            if (!match) {
              res.render('users/login', {user:req.body})
            } else {
              req.session.user = user 
              res.redirect('/')
            }
          })
      }
    }) 
    .catch(next)
}

module.exports.doSocialLogin = (req, res, next) => {
  passport.authenticate('google-users', (error, user) => {
    if (error) {
      next(error);
    } else {
      req.session.user = user;
      res.redirect('/')
    }
  })(req, res, next);
}

