const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const EMAIL_PATTERN = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const SALT_WORK_FACTOR = 10;

const generateRandomToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
}

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name needs at last 8 chars'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [EMAIL_PATTERN, 'Email is invalid']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password needs at last 8 chars']
  },
  logo: {
    type: String,
  },
  description: {
    type: String
  },
  validateToken: {
    type: String,
    default: generateRandomToken
  },
  validated: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

companySchema.pre('save', function (next) {
  const company = this;

  if (company.isModified('password')) {
    bcrypt.genSalt(SALT_WORK_FACTOR)
      .then(salt => {
        return bcrypt.hash(company.password, salt)
          .then(hash => {
            company.password = hash;
            next();
          });
      })
      .catch(error => next(error));
  } else {
    next();
  }
});

companySchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
}

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
