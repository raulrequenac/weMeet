const express = require('express');
const uploadCloud = require('../config/cloudinary.config.js');
const usersController = require('../controllers/users.controller');
const eventsController = require('../controllers/events.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

module.exports = router;

router.get('/', eventsController.index)



router.get('/users/new', usersController.new)
router.post('/users', uploadCloud.array('images', 6), usersController.create)

router.get('/login', usersController.login)
router.post('/login', usersController.doLogin)

