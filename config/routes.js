const express = require('express');
const uploadCloud = require('../config/cloudinary.config.js');
const usersController = require('../controllers/users.controller');
const companiesController = require('../controllers/companies.controller');
const eventsController = require('../controllers/events.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const passport = require('passport');

const router = express.Router();

module.exports = router;


/*
  Users
*/
//Index
router.get('/users', authMiddleware.isAuthenticated, usersController.index)
//Create
router.get('/users/new', authMiddleware.isNotAuthenticated, usersController.new)
router.post('/users/new', authMiddleware.isNotAuthenticated, uploadCloud.array('images', 6), usersController.create)
//Update
router.get('/users/edit/:id', authMiddleware.isAuthenticated, usersController.edit)
router.post('/users/edit', authMiddleware.isAuthenticated, usersController.doEdit)
//Delete
router.get('/users/delete/:id', authMiddleware.isAuthenticated, usersController.delete);
//Profile
router.get('/users/profile', authMiddleware.isAuthenticated, usersController.profile);

/*
  Companies
*/
//Index
router.get('/companies', authMiddleware.isAuthenticated, companiesController.index)
//Create
router.get('/companies/new', authMiddleware.isNotAuthenticated, companiesController.new)
router.post('/companies', authMiddleware.isNotAuthenticated, uploadCloud.single('logo'), companiesController.create)
//Update
router.get('/companies/edit/:id', authMiddleware.isAuthenticated, companiesController.edit)
router.post('/companies/edit', authMiddleware.isAuthenticated, companiesController.doEdit)
//Delete
router.get('/companies/delete/:id', authMiddleware.isAuthenticated, companiesController.delete);
//Profile
router.get('/companies/profile', authMiddleware.isAuthenticated, companiesController.profile);

/*
  Events
*/


/*
  Login
*/
router.get('/login', authMiddleware.isNotAuthenticated, (_, res) => {res.render('login')})
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

/*
  Logout
*/
router.post('/logout', authMiddleware.isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
})
