
new DataTable('#example');

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data, and draws it.
function drawChart(responseData) {
    // Create a data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Category');
    data.addColumn('number', 'Percentage');

    // Add data rows from the 'percentageDistribution' object.
    for (var category in responseData.percentageDistribution) {
        data.addRow([category, responseData.percentageDistribution[category]]);
    }

    // Set chart options.
    var options = {
        'legend':'right',
        'title': 'Pie Chart',
        'is3D':true,
        'width': 400,
        'height': 300,
    };

    // Instantiate and draw the pie chart.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

// Add an event listener for the "Visualize" button
const visualizeButton = document.getElementById('visualizeButton');
visualizeButton.addEventListener('click', () => {
    const columnName = document.getElementById('columnInput').value;
    const csvId = visualizeButton.getAttribute('csvId'); // Get the CSV ID from the button attribute

    // Check if the column name is not empty
    if (columnName.trim() === '') {
        // Display an error message
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = 'Column name cannot be empty.';
        return; // Stop further execution
    }

    // Clear any previous error message
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';

    // Send an AJAX request to the server
    $.ajax({
        url: `/visualize/${csvId}/${columnName}`,
        type: 'GET',
        success: function (response) {
            // Handle the response from the server (received JSON data)
            // Call a function to create and display the pie chart using Google Charts
            console.log(response)
            drawChart(response);
        },
        error: function (error) {
            // Display the error message sent by the server
            errorMessage.textContent = error.responseJSON ? error.responseJSON.error : 'An error occurred.';
        },
    });
});


