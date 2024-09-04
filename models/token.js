const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour (can be adjusted)
  },
}, {
  timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
