const mongoose = require('mongoose');
const User = require('../models/user.model');
const mailer = require('../config/mailer.config');
const passport = require('passport');

module.exports.profile = (req, res, next) => {
  const userId = req.params.id;
  const userEnrollsPromise = userEnrollsPromise
    .find({user: userId})
    .populate('event');
  const userPromise = User.findById(userId);

  Promise.all([userEnrollsPromise, userPromise])
    .then(([enrolls, user]) => {
      const userEvents = userEnrolls.map(enroll => enroll.event).sort((a, b) => a.date - b.date ).slice(0, 10);
      res.render('users/profile', {dateEvents: _groupEventsByDate(userEvents), user})
    })
    .catch(next);
}
_groupEventsByDate = function (events) {
  const dates = events.map(event => ({
    month: event.date.getMonth(),
    year: event.date.getFullYear()
  }));
  const uniqueDates = dates.reduce((acc, curr) => {
    if (!acc.some(elem => elem.month === curr.month && elem.year === curr.year)) {
      return [...acc, curr]
    }
    return acc
  }, [])

  return uniqueDates.map(date => ({
    monthYear: `${date.month+1}/${date.year}`,
    events: events
      .filter(event => {
        return event.date.getMonth() === date.month &&
          event.date.getFullYear() === date.year;
      })
      .map(event => ({
        event: `${event.date.getDate()} -- ${event.name}`,
        eventId: event.id
      }))
  }));
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
    bio
  } = req.body;

  User.findByIdAndUpdate(req.session.user.id, {
      name,
      email,
      bio
    }, {
      new: true
    })
    .then(res.redirect('/'))
    .catch(next);
}

module.exports.editImages = (req, res) => {
  res.render('users/editImages', {
    user: req.session.user
  })
}

module.exports.doEditImages = (req, res, next) => {
  const {images} = req.body;

  User.findByIdAndUpdate(req.session.user.id, {images}, {new: true})
    .then(res.redirect('/'))
    .catch(next);
}

module.exports.editPassword = (req, res) => {
  res.render('users/editPassword', {
    user: req.session.user
  })
}

module.exports.doEditPassword = (req, res, next) => {
  const {password} = req.body;

  User.findByIdAndUpdate(req.session.user.id, {password}, {new: true})
    .then(res.redirect('/'))
    .catch(next);
}

module.exports.delete = (req, res, next) => {
  User.findByIdAndRemove(req.session.user.id)
    .then(res.redirect('/login'))
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

