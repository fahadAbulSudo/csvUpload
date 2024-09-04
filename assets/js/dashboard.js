$(document).ready(function () {
  
  // Initialize Socket.IO client
  const socket = io(); 

  // Handle file input change event
  const fileInput = document.getElementById('csvFile');
  const selectedFileName = document.getElementById('selectedFileName');

  fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
          selectedFileName.textContent = `Selected file: ${fileInput.files[0].name}`;
      } else {
          selectedFileName.textContent = '';
      }
  });

  // Handle form submission for CSV upload
  $('.custom-upload-form').on('submit', function (e) {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file) {
          alert('Please choose a CSV file.');
          return;
      }

      const reader = new FileReader();
      reader.onload = function () {
          const fileBuffer = reader.result;
          const fileName = file.name;
          const groupId = userGroupId; // Get group ID from the script in EJS
          const userIdea = userIde;

          // Emit the file data to the server
          socket.emit('upload-csv', { fileBuffer, fileName, groupId, userIdea });

          // Listen for success message from the server
          socket.on('upload-success', function (data) {
              // Display success message
              alert(data.message);
              location.reload(); // Reload the page to see the updated file list
          });

          // Listen for error message from the server
          socket.on('upload-error', function (data) {
              // Display error message
              alert(data.error);
          });
      };

      reader.readAsArrayBuffer(file); // Read the file as a binary buffer
  });

  // Add a click event listener to elements with the 'delete-csv' class
  $('.delete-csv').on('click', async function (e) {
    e.preventDefault();
    
    // Get the 'data-csvid' and 'data-groupid' attribute values from the clicked element
    const csvId = $(this).data('csvid');
    const groupId = $(this).data('groupid');
    
    // Display a confirmation dialog for deleting the CSV file
    if (confirm('Are you sure you want to delete this CSV file?')) {
      // Send an AJAX DELETE request to the server to delete the CSV file
      await $.ajax({
        url: `/dashboard/${groupId}/delete/${csvId}`,
        type: 'DELETE',
        success: function(response) {
          // Remove the CSV file entry from the DOM
          console.log(response.message)
          $(`[data-csvid="${csvId}"]`).closest('.csv-entry').remove();
          
          // Show a success notification using the Noty library
          new Noty({
            theme: 'relax',
            text: response.message, // Use the message from the server
            type: 'success',
            layout: 'topRight',
            timeout: 1500
          }).show();
        },
        error: function(xhr) {
          // Show an error notification using the Noty library
          new Noty({
            theme: 'relax',
            text: xhr.responseJSON.error || "Error deleting CSV",
            type: 'error',
            layout: 'topRight',
            timeout: 1500
          }).show();
        }
      });
    }
  });

});
