const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  mobile: { type: String, required: true, trim: true },
  gender: { type: String, trim: true },
  dateOfBirth: Date,
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  otherCity: { type: Boolean, default: false },
  address: { type: String, trim: true },
  skills: { type: [{ type: String, trim: true }], default: [] },
}, { timestamps: true, toJSON: { versionKey: false } });

module.exports = mongoose.model('Employee', employeeSchema);
