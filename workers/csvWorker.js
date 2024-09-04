const fs = require('fs');
const Csv = require('../models/csv');
const Group = require('../models/group');
const { csvQueue } = require('../config/queue');
const { delCache } = require('../config/redisClient');

// Worker to process file upload tasks
csvQueue.process(async (job) => {
  const { fileBuffer, fileName, groupId, userIdea } = job.data;

  try {
    // Ensure fileBuffer is a Buffer
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    // Define the path where the file will be saved
    const filePath = `uploads/files/${Date.now()}-${fileName}`;

    // Save the file buffer to the server
    fs.writeFileSync(filePath, buffer);

    // Create a new Csv document and save it to the database
    const newCsv = new Csv({
      fileName: fileName,
      filePath: filePath,
      uploadedBy: userIdea,
      group: groupId,
    });

    await newCsv.save();

    // Add the CSV ID to the group's csvFiles array
    await Group.findByIdAndUpdate(groupId, { $push: { csvFiles: newCsv._id } });

    // Invalidate or clear the cache entries related to the updated CSV list
    await delCache(`csvFiles:${groupId}`);

    // Invalidate cache entries related to the newly uploaded CSV
    await delCache(`csvHeaders:${newCsv._id}`);
    await delCache(`columnStats:${newCsv._id}:*`);

  } catch (error) {
    console.error('Error processing file upload task:', error);
    throw new Error('Failed to process CSV upload');
  }
});
