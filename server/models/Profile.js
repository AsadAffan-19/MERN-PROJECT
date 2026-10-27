const mongoose = require('mongoose');

// The contractor's own details. There is no login, so only one profile document ever exists.
const profileSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },

  companyName: { type: String, trim: true, default: '' },
  companyAddress: { type: String, trim: true, default: '' },
  gstNumber: { type: String, trim: true, default: '' },

  bankName: { type: String, trim: true, default: '' },
  accountHolder: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  ifscCode: { type: String, trim: true, default: '' },
  upiId: { type: String, trim: true, default: '' },
});

module.exports = mongoose.model('Profile', profileSchema);
