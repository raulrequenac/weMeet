const express = require('express');
const uploadCloud = require('../config/cloudinary.config.js');
const usersController = require('../controllers/users.controller');
const companiesController = require('../controllers/companies.controller');
const eventsController = require('../controllers/events.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const passport = require('passport');

const router = express.Router();

module.exports = router;

router.get('/', authMiddleware.isAuthenticated, (_, res) => {res.render('events/index')})

//Create a new user or Company
router.get('/users/new', authMiddleware.isNotAuthenticated, usersController.new)
router.post('/users', authMiddleware.isNotAuthenticated, uploadCloud.array('images', 6), usersController.create)
router.get('/companies/new', authMiddleware.isNotAuthenticated, companiesController.new)
router.post('/companies', authMiddleware.isNotAuthenticated, uploadCloud.single('logo'), companiesController.create)

// Login Front 
router.get('/login', authMiddleware.isNotAuthenticated, (_, res) => {res.render('login/index')})
// Login a user  
router.get('/login/users', authMiddleware.isNotAuthenticated, usersController.login)
router.post('/login/users', authMiddleware.isNotAuthenticated, usersController.doLogin)
// Login a Company   
router.get('/login/companies', authMiddleware.isNotAuthenticated, companiesController.login)
router.post('/login/companies', authMiddleware.isNotAuthenticated, companiesController.doLogin)
// Login a user with Google
router.post('/login/google/users', authMiddleware.isNotAuthenticated, passport.authenticate('google-users', { scope: ['openid', 'profile', 'email'] }))
router.get('/login/google/users/callback', authMiddleware.isNotAuthenticated, usersController.doSocialLogin)
// Login a company with Google
router.post('/login/google/companies', authMiddleware.isNotAuthenticated, passport.authenticate('google-companies', { scope: ['openid', 'profile', 'email'] }))
router.get('/login/google/companies/callback', authMiddleware.isNotAuthenticated, companiesController.doSocialLogin)

//logout
router.post('/logout', authMiddleware.isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
})
