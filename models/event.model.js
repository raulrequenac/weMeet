const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name needs at last 8 chars'],
    trim: true
  },
  description: {
    type: String
  },
  image: [String], 
  location: {
    type: String, 
    required:[true, 'Location is required'],
  },
  categories:{
    type: String, 
  }, 
  capacity: {
    type: Number, 
  }, 
  price:{
    type: Number, 
  }, 
}, { timestamps: true })





const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
