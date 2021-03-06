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
  Events
*/
//Index
router.get('/', authMiddleware.isAuthenticated, eventsController.index)
//Create
router.post('/events/new', authMiddleware.isAuthenticated, uploadCloud.array('images'), eventsController.create)
//Update
router.get('/events/edit/:id', authMiddleware.isAuthenticated, eventsController.edit)
router.post('/events/edit/:id', authMiddleware.isAuthenticated, eventsController.doEdit)
router.get('/events/edit/images/:id', authMiddleware.isAuthenticated, eventsController.editImages)
router.post('/events/edit/images/:id', authMiddleware.isAuthenticated, eventsController.doEditImages)
//Show
router.get('/events/:id', authMiddleware.isAuthenticated, eventsController.show)
//Enroll
router.post('/events/:id/enroll', authMiddleware.isAuthenticated, eventsController.enroll)

/*
  Users
*/
//Create
router.get('/users/new', authMiddleware.isNotAuthenticated, usersController.new)
router.post('/users/new', authMiddleware.isNotAuthenticated, uploadCloud.array('images'), usersController.create)
//Update
router.get('/users/edit', authMiddleware.isAuthenticated, usersController.edit)
router.post('/users/edit', authMiddleware.isAuthenticated, usersController.doEdit)
router.get('/users/edit/images', authMiddleware.isAuthenticated, usersController.editImages)
router.post('/users/edit/images', authMiddleware.isAuthenticated, uploadCloud.array('images'), usersController.doEditImages)
router.get('/users/edit/password', authMiddleware.isAuthenticated, usersController.editPassword)
router.post('/users/edit/password', authMiddleware.isAuthenticated, usersController.doEditPassword)
//Delete
router.get('/users/delete/', authMiddleware.isAuthenticated, usersController.delete);
//Profile
router.get('/users/:id', authMiddleware.isAuthenticated, usersController.profile);

/*
  Companies
*/
//Create
router.get('/companies/new', authMiddleware.isNotAuthenticated, companiesController.new)
router.post('/companies/new', authMiddleware.isNotAuthenticated, uploadCloud.single('logo'), companiesController.create)
//Update
router.get('/companies/edit', authMiddleware.isAuthenticated, companiesController.edit)
router.post('/companies/edit', authMiddleware.isAuthenticated, companiesController.doEdit)
router.get('/companies/edit/logo', authMiddleware.isAuthenticated, companiesController.editLogo)
router.post('/companies/edit/logo', authMiddleware.isAuthenticated, uploadCloud.single('logo'), companiesController.doEditLogo)
router.get('/companies/edit/password', authMiddleware.isAuthenticated, companiesController.editPassword)
router.post('/companies/edit/password', authMiddleware.isAuthenticated, companiesController.doEditPassword)
//Delete
router.get('/companies/delete/', authMiddleware.isAuthenticated, companiesController.delete);
//Profile
router.get('/companies/:id', authMiddleware.isAuthenticated, companiesController.profile);

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
