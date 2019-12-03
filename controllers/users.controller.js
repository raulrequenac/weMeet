const mongoose = require('mongoose');
const User = require('../models/user.model');
const mailer = require('../config/mailer.config');

module.exports.index = (_, res) => {
  res.render('events/index')
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
