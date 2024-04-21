const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  f_Id: { type: Number },
  f_Image: String,
  f_Name: { type: String, required: true },
  f_Email: String,
  f_Mobile: String,
  f_Designation: String,
  f_gender: String,
  f_Course: String,
  f_Createdate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', employeeSchema);