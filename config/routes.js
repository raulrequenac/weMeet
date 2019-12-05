const express = require('express');
const uploadCloud = require('../config/cloudinary.config.js');
const usersController = require('../controllers/users.controller');
const companiesController = require('../controllers/companies.controller');
const eventsController = require('../controllers/events.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

module.exports = router;

router.get('/', (_, res) => {
  res.render('events/index')
})

router.get('/users/new', usersController.new)
router.post('/users', uploadCloud.array('images', 6), usersController.create)

router.get('/companies/new', companiesController.new)
router.post('/companies', uploadCloud.single('logo'), companiesController.create)

router.get('/login', (_, res) => {
  res.render('login/index')
});
router.get('/login/users', usersController.login)
router.post('/login/users', usersController.doLogin)
router.get('/login/companies', companiesController.login)
router.post('/login/companies', companiesController.doLogin)
