window.onload = function() {
    // Get the CSV headers and CSV ID from the hidden input fields
    const csvHeaders = JSON.parse(document.getElementById('csvHeaders').value);
    const csvId = document.getElementById('csvId').value;

    // Debugging: Log the values to verify they are correctly retrieved
    console.log(csvHeaders);
    console.log(csvId);

    document.getElementById('columnCheckForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        
        const columnName = document.getElementById('columnName').value.trim();
        const validationMessage = document.getElementById('validationMessage');
        const statisticsContainer = document.getElementById('statisticsContainer');

        if (csvHeaders.includes(columnName)) {
            validationMessage.textContent = `The column "${columnName}" exists in the CSV file.`;
            validationMessage.style.color = 'darkgreen';

            // Fetch column statistics by calling the API
            fetch(`/describe/${csvId}/${columnName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        statisticsContainer.innerHTML = `<p style="color: red;">${data.error}</p>`;
                    } else {
                        // Display the statistics
                        let statsHtml = '<h3>Column Statistics:</h3><ul>';
                        for (const [key, value] of Object.entries(data)) {
                            statsHtml += `<li>${key}: ${value}</li>`;
                        }
                        statsHtml += '</ul>';
                        statisticsContainer.innerHTML = statsHtml;
                    }
                })
                .catch(error => {
                    console.error('Error fetching column statistics:', error);
                    statisticsContainer.innerHTML = `<p style="color: red;">Error fetching column statistics.</p>`;
                });

        } else {
            validationMessage.textContent = `The column "${columnName}" does not exist in the CSV file.`;
            validationMessage.style.color = 'red';
            statisticsContainer.innerHTML = ''; // Clear previous statistics
        }
    });
};
