const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  csvFiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Csv'
    }
  ]
}, {
  timestamps: true,
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;