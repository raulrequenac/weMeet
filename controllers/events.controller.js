const mongoose = require('mongoose');

module.exports.index = (_, res) => {
  res.render('events/index')
}
