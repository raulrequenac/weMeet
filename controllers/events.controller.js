const mongoose = require('mongoose');
const Event = require('../models/event.model');
const Enroll = require('../models/enroll.model')

module.exports.create = (req, res, next) => {
  const event = new Event({
    company: req.session.user.id,
    name: req.body.name,
    description: req.body.description,
    image: req.files[0] ? req.files.map(file => file.url) : '/images/user-profile.jpg',
    location: req.body.location,
    categories: req.body.categories,
    capacity: req.body.capacity,
    price: req.body.price,
  })
  event.save()
    .then(() => {
      req.session.genericSuccess = "event created"
      res.redirect('/companies')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        req.session.genericError = "can't create event"
        res.redirect('/companies')
      } else {
        next(error);
      }
    })
}

module.exports.enroll = (req, res, next) => {
  const params = {
    enroll: req.params.id,
    user: req.session.user.id
  }
  Enroll.findOne(params)
    .then(enroll => {
      if (enroll) {
        enroll.findByIdAndRemove(enroll.id)
          .then(() => {
            res.json({
              enrolls: -1
            })
          })
          .catch(next)
      } else {
        const enroll = new Enroll(params)
        enroll.save()
          .then(() => {
            res.json({
              enrolls: 1
            })
          })
          .catch(next)
      }
    })
    .catch(next)
}
