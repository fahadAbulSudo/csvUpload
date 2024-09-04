const mongoose = require('mongoose');

// Define the schema for CSV documents
const csvSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
}, {
  timestamps: true,
});
// Create a model named 'Csv' based on the schema
const Csv = mongoose.model("Csv", csvSchema);

// Export the 'Csv' model
module.exports = Csv;
