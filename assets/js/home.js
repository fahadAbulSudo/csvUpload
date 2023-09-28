// Wait for the document to be fully loaded before executing JavaScript code
$(document).ready(async function () {
  // Add a click event listener to elements with the 'delete-csv' class
  $('.delete-csv').on('click', async function (e) {
    e.preventDefault();
    
    // Get the 'data-csvid' attribute value from the clicked element
    const csvId = $(this).data('csvid');
    console.log(csvId);

    // Display a confirmation dialog for deleting the CSV file
    if (confirm('Are you sure you want to delete this CSV file?')) {
      // Send an AJAX DELETE request to the server to delete the CSV file
      await $.ajax({
        url: `/delete/${csvId}`,
        type: 'DELETE',
        success: function(response){
          // Redirect to the homepage after successful deletion
          window.location.href = '/';
          
          // Show a success notification using the Noty library
          new Noty({
            theme: 'relax',
            text: "Comment Deleted",
            type: 'success',
            layout: 'topRight',
            timeout: 1500
          }).show();
        }
      });
    }
  });
});
