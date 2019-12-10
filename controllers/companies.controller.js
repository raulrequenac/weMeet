const mongoose = require('mongoose');
const Company = require('../models/company.model');
const mailer = require('../config/mailer.config');

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
    logo: req.file ? req.file.url : undefined
  })

  company.save()
    .then((company) => {
      mailer.sendValidateEmail(company)
      res.redirect('/')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('companies/new', {
          company,
          error: error.errors
        })
      } else if (error.code === 11000) {
        res.render('/', {
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

module.exports.login = (req, res, next) => {
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
              req.session.company = company 
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
