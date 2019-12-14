const mongoose = require('mongoose');
const Company = require('../models/company.model');
const mailer = require('../config/mailer.config');

module.exports.index = (_, res) => {
  res.render('companies/index')
}

module.exports.profile = (req, res) => {
  res.render('companies/profile', {company: req.session.user})
}

module.exports.new = (_, res) => {
  res.render('companies/new', {
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
  res.render('companies/edit', {
      company: req.session.user
    })
}

module.exports.doEdit = (req, res, next) => {
  const {
    name,
    email,
    description,
    logo
  } = res.body;

  User.findByIdAndUpdate(req.session.user.id, {
      name,
      email,
      description,
      logo
    }, {
      new: true
    })
    .then(res.redirect('/companies'))
    .catch(error => next(error));
}

module.exports.editImages = (req, res) => {
  res.render('companies/editImages', {
    company: req.session.user
  })
}

module.exports.doEditImages = (req, res, next) => {
  const {images} = res.body;

  Company.findByIdAndUpdate(req.session.user.id, {images}, {new: true})
    .then(res.redirect('/companies'))
    .catch(next);
}

module.exports.editPassword = (req, res) => {
  res.render('companies/editPassword', {
    company: req.session.user
  })
}

module.exports.doEditPassword = (req, res, next) => {
  const {password} = res.body;

  Company.findByIdAndUpdate(req.session.user.id, {password}, {new: true})
    .then(res.redirect('/companies'))
    .catch(next);
}

module.exports.delete = (req, res, next) => {
  Company.findByIdAndRemove(req.session.user.id)
    .then(res.redirect('/login'))
    .catch(error => next(error));
}

module.exports.login = (_, res) => {
  res.render('companies/login')
}

module.exports.doLogin = (req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.render('companies/login', {company:req.body})
  } 
  Company.findOne( {email:email, validated:true})
    .then(company => {
      if (!company) {
        res.render('companies/login', {company:req.body})
      } else {
        return company.checkPassword (password)
          .then (match => {
            if (!match) {
              res.render('companies/login', {company:req.body})
            } else {
              req.session.user = company 
              res.redirect('/companies')
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
      res.redirect('/companies')
    }
  })(req, res, next);
}
