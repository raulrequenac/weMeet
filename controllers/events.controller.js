const mongoose = require('mongoose');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const Enroll = require('../models/enroll.model');

module.exports.index = (req, res, next) => {
  const user = req.session.user
  const role = user.role === "user" ? "users" : "companies";
  const {
    from,
    to,
    category,
    price
  } = req.query

  const criteria = {
    ...(from && to ? {
      date: {
        $lte: to,
        $gte: from
      }
    } : {}),
    ...category ? {
      categories: {
        $in: [category]
      }
    } : {},
    ...price ? {
      price: {
        $lte: Number(price)
      }
    } : {}
  }

  const userEventsPromise = Event.find()
    .sort({
      date: -1
    })
    .limit(10)
    .populate('company')
    .populate({
      path: 'enroll',
      match: {
        user: user.id
      }
    });

  const searchEventsPromise = Event.find(criteria)
    .sort({
      date: -1
    })
    .limit(10)
    .populate('company')
    .populate('enroll');

  Promise.all([userEventsPromise, searchEventsPromise])
    .then(([userEvents, searchEvents]) => {
      res.render(
        `${role}/index`, {
          event: new Event(),
          nextEvent: userEvents[0],
          searchEvents,
          dateEvents: _groupEventsByDate(userEvents)
        }
      )
    })
    .catch(next)
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
      .map(event => `${date.getDate()} -- ${event.name}`)
  }));
}

module.exports.create = (req, res, next) => {
  const event = new Event({
    company: req.session.user.id,
    name: req.body.name,
    description: req.body.description,
    date: new Date(req.body.date),
    images: req.files[0] ? req.files.map(file => file.url) : '/images/event-default.png',
    location: req.body.location,
    categories: req.body.category,
    capacity: req.body.capacity,
    price: req.body.price,
  })

  event.save()
    .then(() => {
      req.session.genericSuccess = "event created"
      res.redirect('/')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        req.session.genericError = "can't create event"
        res.redirect('/')
      } else {
        next(error);
      }
    })
}

module.exports.edit = (req, res, next) => {
  const id = req.params.id;

  Event.findById(id)
    .then(event => res.render('events/edit', event))
    .catch(next)
}

module.exports.doEdit = (req, res, next) => {
  const id = req.params.id;
  const {
    name,
    description,
    date,
    location,
    categories,
    capacity,
    price
  } = res.body;

  Event.findByIdAndUpdate(id, {
      name,
      description,
      date,
      location,
      categories,
      capacity,
      price
    }, {
      new: true
    })
    .then(res.redirect('/'))
    .catch(next);
}

module.exports.doEditImages = (req, res, next) => {
  const id = req.params.id
  const {
    images
  } = res.body;

  Event.findByIdAndUpdate(id, {
      images
    }, {
      new: true
    })
    .then(res.redirect('/'))
    .catch(next);
}


module.exports.enroll = (req, res, next) => {
  const params = {
    event: req.params.id,
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

module.exports.show = (req, res, next) => {
  Event.findOne({
      id: req.params.id
    })
    .then(event => {
      if (event) {
        res.render('events/show', {
          event
        })
      } else {
        req.session.genericError = 'tweet not found'
        res.redirect('/')
      }
    })
    .catch(next)
}

module.exports.editImages = (req, res) => {
  const id = req.params.id;

  Event.findById(id)
    .then(event => res.render('events/editImages', {
      event
    }))
    .catch(next)
}
