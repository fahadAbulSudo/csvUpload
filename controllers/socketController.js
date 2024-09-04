const fs = require('fs');
const Csv = require('../models/csv');
const Group = require('../models/group');
// const { delCache, setCache } = require('../config/redisClient'); 
const { csvQueue } = require('../config/queue');

// const handleFileUpload = async (data, socket) => {
//   try {
//     const { fileBuffer, fileName, groupId, userIdea } = data;
//     console.log("problem", fileName, groupId, userIdea)
    
//     // Define the path where the file will be saved
//     const filePath = `uploads/files/${Date.now()}-${fileName}`;
    
//     // Save the file buffer to the server
//     fs.writeFileSync(filePath, fileBuffer);

//     // Create a new Csv document and save it to the database
//     const newCsv = new Csv({
//       fileName: fileName,
//       filePath: filePath,
//       uploadedBy: userIdea,
//       group: groupId,
//     });
    
//     await newCsv.save();
    
//     // Add the CSV ID to the group's csvFiles array
//     await Group.findByIdAndUpdate(groupId, { $push: { csvFiles: newCsv._id } });

//     // Invalidate or clear the cache entries related to the updated CSV list
//     await delCache(`csvFiles:${groupId}`);

//     // Invalidate cache entries related to the newly uploaded CSV
//     await delCache(`csvHeaders:${newCsv._id}`);
//     await delCache(`columnStats:${newCsv._id}:*`); // This pattern might need support in your cache library

//     socket.emit('upload-success', { message: 'CSV Uploaded!' });
//   } catch (error) {
//     console.error('Error handling file upload:', error);
//     socket.emit('upload-error', { error: 'Internal server error' });
//   }
// };

// Function to handle Socket.IO connection
// const handleSocketConnection = (socket) => {
//     console.log('A user connected');
  
//     // Handle file uploads via Socket.IO
//     socket.on('upload-csv', (data) => handleFileUpload(data, socket));
  
//     socket.on('disconnect', () => {
//       console.log('User disconnected');
//     });
//   };
  
  // module.exports = {
  //   handleSocketConnection
  // };

  const handleFileUpload = async (data, socket) => {
    try {
      const { fileBuffer, fileName, groupId, userIdea } = data;
  
      // Add the file upload task to the queue
      await csvQueue.add({
        fileBuffer,
        fileName,
        groupId,
        userIdea,
      });
  
      // Immediately acknowledge the upload to the client
      socket.emit('upload-success', { message: 'CSV Upload task added to queue!' });
    } catch (error) {
      console.error('Error adding file upload task to queue:', error);
      socket.emit('upload-error', { error: 'Internal server error' });
    }
  };
  
  // Function to handle Socket.IO connection
  const handleSocketConnection = (socket) => {
    console.log('A user connected');
  
    // Handle file uploads via Socket.IO
    socket.on('upload-csv', (data) => handleFileUpload(data, socket));
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  };
  
  module.exports = {
    handleSocketConnection,
  };