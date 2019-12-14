const mongoose = require('mongoose');
const User = require('../models/user.model');
const mailer = require('../config/mailer.config');
const passport = require('passport')

module.exports.index = (_, res) => {
  res.render('users/index')
}

module.exports.profile = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then(user => res.render('users/profile', {user: user}))
    .catch(next);
}

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
    age: new Date(req.body.age),
    bio: req.body.bio,
    images: req.files[0] ? req.files.map(file => file.url) : '/images/user-profile.jpg'
  })

  user.save()
    .then((user) => {
      mailer.sendValidateEmail(user)
      res.redirect('/login/users')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/new', {
          user,
          error: error.errors
        })
      } else if (error.code === 11000) {
        res.render('users/new', {
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

module.exports.edit = (req, res) => {
    res.render('users/edit', {
      user: req.session.user
    })
}

module.exports.doEdit = (req, res, next) => {
  const {
    name,
    email,
    bio,
    images
  } = res.body;

  User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      bio,
      images
    }, {
      new: true
    })
    .then(res.redirect('/users'))
    .catch(error => next(error));
}

module.exports.delete = (req, res, next) => {
  User.findByIdAndRemove(req.session.user.id)
    .then(res.redirect('/login'))
    .catch(error => next(error));
}

module.exports.login = (_, res) => {
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
              res.redirect('/users')
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
      res.redirect('/users')
    }
  })(req, res, next);
}

