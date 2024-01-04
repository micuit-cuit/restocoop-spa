function submitForm() {
    // Retrieve values from input fields
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('imageUrl').value;

    // Make API call with the entered data
    const requestData = {
        token: getCookie('token'),
        name: name,
        description: description,
        imageUrl: imageUrl,
    };

    fetch('/api/addCategory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([requestData]),
    })
    .then(response => response.json())
    .then(data => {
        // Handle API response
        const responseContainer = document.getElementById('response');
        responseContainer.innerHTML = `<p>Status: ${data.status}</p><p>Message: ${data.message}</p>`;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
