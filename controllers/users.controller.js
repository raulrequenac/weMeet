const mongoose = require('mongoose');
const User = require('../models/user.model');
const Enroll = require('../models/enroll.model');
const eventsController = require('./events.controller');
const mailer = require('../config/mailer.config');
const passport = require('passport');

module.exports.profile = (req, res, next) => {
  const userId = req.params.id;
  const userPromise = User.findById(userId);
  const enrollPromise = Enroll
    .find({user: userId})
    .populate('event')
    
  Promise.all([userPromise, enrollPromise])
    .then(([user, userEnrolls]) => {
      const userEvents = userEnrolls.map(enroll => enroll.event).sort((a, b) => a.date - b.date ).slice(0, 10);
      res.render('users/profile', {dateEvents: eventsController.groupEventsByDate(userEvents), user})
    })
    .catch(next);
}

module.exports.new = (_, res) => {
  res.render('users/form', {
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
        res.render('users/form', {
          user,
          error: error.errors
        })
      } else if (error.code === 11000) {
        res.render('users/form', {
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
    res.render('users/form', {
      user: req.session.user
    })
}

module.exports.doEdit = (req, res, next) => {
  const {
    name,
    email,
    age,
    bio
  } = req.body;

  User.findByIdAndUpdate(req.session.user.id, {
      name,
      email,
      age, 
      bio
    }, {
      new: true
    })
    .then(user => {
      req.session.user = user;
      res.redirect('/')
    })
    .catch(next);
}

module.exports.editImages = (req, res) => {
  res.render('users/editImages', {
    user: req.session.user
  })
}

module.exports.doEditImages = (req, res, next) => {
  const images = req.files[0] ? req.files.map(file => file.url) : '/images/user-profile.jpg';

  if (images.length) {
    User.findByIdAndUpdate(req.session.user.id, {images}, {new: true})
    .then(user => {
      req.session.user = user
      res.redirect('/')
    })
    .catch(next);
  } else {
    res.redirect('/')
  }
}

module.exports.editPassword = (req, res) => {
  res.render('users/editPassword', {
    user: req.session.user
  })
}

module.exports.doEditPassword = (req, res, next) => {
  const password = req.body.password;

  if (password) {
    User.findByIdAndUpdate(req.session.user.id, {password}, {new: true})
    .then(user => {
      req.session.user = user
      res.redirect('/')
    })
    .catch(next);
  } else {
    res.redirect('/')
  }
}

module.exports.delete = (req, res, next) => {
  User.findByIdAndRemove(req.session.user.id)
    .then(res.redirect('/logout'))
    .catch(next);
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

