const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [8, 'Name needs at last 8 chars'],
    trim: true
  },
  description: String,
  images: [String], 
  location: {
    type: String, 
    required:[true, 'Location is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  categories: [String], 
  capacity: Number, 
  price:Number
}, { timestamps: true })

eventSchema.virtual('enroll', {
  ref: 'Enroll',
  localField: '_id',
  foreignField: 'event',
  justOne: false,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
