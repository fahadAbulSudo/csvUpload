$(document).ready(function () {
    $('#generate-token-btn').on('click', async function (e) {
        e.preventDefault();

        // Get the groupId from the button's data attribute
        const groupId = $(this).data('groupid');
        // Send an AJAX POST request to generate the token
        try {
            const response = await $.ajax({
                url: '/generate-token',
                type: 'POST',
                data: { groupId: groupId },
                success: function (data) {
                    // Show the generated token in the designated area
                    $('#generated-token').html(`
                        <p>Token generated successfully!</p>
                        <p><strong>Token:</strong> ${data.token}</p>
                    `);

                    // Show a success notification using the Noty library
                    new Noty({
                        theme: 'relax',
                        text: "Token generated successfully!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                    }).show();
                },
                error: function (xhr, status, error) {
                    // Show an error notification
                    new Noty({
                        theme: 'relax',
                        text: "Failed to generate token. Please try again.",
                        type: 'error',
                        layout: 'topRight',
                        timeout: 1500
                    }).show();
                }
            });
        } catch (err) {
            console.error('Error generating token:', err);
        }
    });
});
