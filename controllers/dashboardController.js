const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Csv = require('../models/csv');
const Group = require('../models/group');
const mongoose = require('mongoose');
const { getCache, setCache, delCache } = require('../config/redisClient');

// Function to check if the uploaded file has a valid file type (CSV or text)
const isValidFileType = (file) => {
  const allowedMimeTypes = ['text/csv', 'text/plain'];
  return allowedMimeTypes.includes(file.mimetype);
};

// Configure Multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/files'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename); // Set a unique filename for the uploaded file
  },
});

// Initialize Multer with custom storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (isValidFileType(file)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only CSV or text files are allowed.'));
    }
  },
});

// Middleware for handling file uploads
exports.uploadFile = upload.single('csvFile');

// Handle uploaded files and save them to the database
exports.handleFileUpload = async (req, res) => {
  try {
    const { groupId } = req.params; // Fetch group ID from request parameters
    const user = req.user;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, path: filePath } = req.file;

    // Create a new Csv document with file information and save it to the database
    const newCsv = new Csv({
      fileName: originalname,
      filePath: filePath,
      uploadedBy: user.id,
      group: groupId,
    });

    await newCsv.save();

    // Add the CSV ID to the group's csvFiles array
    await Group.findByIdAndUpdate(groupId, { $push: { csvFiles: newCsv._id } });

    req.flash('success', 'CSV Uploaded!');
    return res.status(200).redirect(`/dashboard/${groupId}`);
  } catch (error) {
    console.log(error)
    req.flash('error', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a CSV file from both the database and the file system
exports.deleteFile = async (req, res) => {
  const { csvId, groupId } = req.params;
  
  try {
    // Check if the user is an admin
    if (req.user.role !== 'Admin') {
      req.flash('error', 'You are not authorized to delete this CSV file');
      return res.redirect('back'); // Redirect back to the same page
    }

    const csv = await Csv.findById(csvId);
    if (!csv) {
      req.flash('error', 'CSV file not found');
      return res.redirect('back'); // Redirect back to the same page
    }

    // Remove the file from the file system
    if (fs.existsSync(csv.filePath)) {
      fs.unlinkSync(csv.filePath);
    }

    // Delete the CSV document from the database
    await csv.deleteOne();

    // Remove the CSV ID from the group's csvFiles array
    await Group.findByIdAndUpdate(groupId, { $pull: { csvFiles: csv._id } });

    // Invalidate cache entries related to the deleted CSV
    await delCache(`csvHeaders:${csvId}`);
    // Cache for column stats may have multiple keys; clear them all
    await delCache(`columnStats:${csvId}:*`); // This pattern might need support in your cache library
    await delCache(`csvFiles:${groupId}`);

    // Flash success message
    req.flash('success', 'CSV Deleted!');
    
    // Send success response
    return res.status(200).json({ message: 'CSV Deleted!' });
  } catch (err) {
    req.flash('error', 'Internal server error');
    return res.redirect('back'); // Redirect back to the same page in case of an error
  }
};

// List uploaded CSV files and render the dashboard page
exports.listUploadedFiles = async (req, res) => {
  const { groupId } = req.params;
  const user = req.user;
  const cacheKey = `csvFiles:${groupId}`; // Unique key for caching CSV files list

  try {
    // Check if the CSV list is in the cache
    let csvFiles = await getCache(cacheKey);

    if (csvFiles) {
      console.log('Cache hit');
    } else {
      console.log('Cache miss');
      // If not in cache, query the database
      csvFiles = await Csv.find({ group: groupId }).sort({ createdAt: 'desc' });

      // Cache the result with a TTL of 10 minutes (600 seconds)
      await setCache(cacheKey, csvFiles, 600);
    }

    // Render the dashboard page with a list of uploaded CSV files
    res.render('dashboard', { csvFiles, user, groupId, pageTitle: 'CSV File Upload and List' });
  } catch (error) {
    console.error('Error fetching CSV files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





