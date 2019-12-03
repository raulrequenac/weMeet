const mongoose = require('mongoose');

const enrollSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
}, { timestamps: true })

const Enroll = mongoose.model('Enroll', enrollSchema);

module.exports = Enroll;
