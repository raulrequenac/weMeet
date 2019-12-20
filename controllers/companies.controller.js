const mongoose = require('mongoose');
const Company = require('../models/company.model');
const Event = require('../models/event.model');
const eventsController = require('./events.controller');
const mailer = require('../config/mailer.config');
const passport = require('passport');


module.exports.profile = (req, res, next) => {
  const companyId = req.params.id;
  const companyPromise = Company.findById(companyId);
  const eventsPromise = Event.find({
    company: companyId
  });

  Promise.all([companyPromise, eventsPromise])
    .then(([company, events]) => {
      console.log(company)
      res.render('companies/profile', {
        dateEvents: eventsController.groupEventsByDate(events),
        company
      });
    })
    .catch(next);
}

module.exports.new = (_, res) => {
  res.render('companies/form', {
    company: new Company()
  })
}

module.exports.create = (req, res, next) => {
  const company = new Company({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    description: req.body.description,
    logo: req.file ? req.file.url : '/images/company-profile.jpg'
  })

  company.save()
    .then((company) => {
      mailer.sendValidateEmail(company)
      res.redirect('/login/companies')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('companies/new', {
          company,
          error: error.errors
        })
      } else if (error.code === 11000) {
        res.render('/login/companies', {
          company: {
            ...company,
            password: null
          },
          genericError: 'company exists'
        })
      } else {
        next(error);
      }
    })
}

module.exports.edit = (req, res) => {
  res.render('companies/form', {
    company: req.session.user
  })
}

module.exports.doEdit = (req, res, next) => {
  const {
    name,
    email,
    description,
    logo
  } = req.body;

  User.findByIdAndUpdate(req.session.user.id, {
      name,
      email,
      description,
      logo
    }, {
      new: true
    })
    .then(user => {
      req.session.user = user
      res.redirect('/')
    })
    .catch(next);
}

module.exports.editLogo = (req, res) => {
  res.render('companies/editLogo', {
    company: req.session.user
  })
}

module.exports.doEditLogo = (req, res, next) => {
  const logo = req.file ? req.file.url : '/images/company-profile.jpg'

  Company.findByIdAndUpdate(req.session.user.id, {
      logo
    }, {
      new: true
    })
    .then(user => {
      req.session.user = user
      res.redirect('/')
    })
    .catch(next);
}

module.exports.editPassword = (req, res) => {
  res.render('companies/editPassword', {
    company: req.session.user
  })
}

module.exports.doEditPassword = (req, res, next) => {
  const password = req.body.password;

  if (password) {
    Company.findByIdAndUpdate(req.session.user.id, {
        password
      }, {
        new: true
      })
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
  Company.findByIdAndRemove(req.session.user.id)
    .then(res.redirect('/logout'))
    .catch(error => next(error));
}

module.exports.login = (_, res) => {
  res.render('companies/login')
}

module.exports.doLogin = (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) {
    return res.render('companies/login', {
      company: req.body
    })
  }
  Company.findOne({
      email: email,
      validated: true
    })
    .then(company => {
      if (!company) {
        res.render('companies/login', {
          company: req.body
        })
      } else {
        return company.checkPassword(password)
          .then(match => {
            if (!match) {
              res.render('companies/login', {
                company: req.body
              })
            } else {
              req.session.user = company
              res.redirect('/')
            }
          })
      }
    })
    .catch(next)
}

module.exports.doSocialLogin = (req, res, next) => {
  passport.authenticate('google-companies', (error, company) => {
    if (error) {
      next(error);
    } else {
      req.session.user = company;
      res.redirect('/')
    }
  })(req, res, next);
}
