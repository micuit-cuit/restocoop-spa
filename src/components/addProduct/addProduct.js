function submitForm() {
    // Retrieve values from input fields
    const sku = document.getElementById('sku').value;
    const name = document.getElementById('name').value;
    const categoryID = document.getElementById('categoryID').value;
    const quantity = document.getElementById('quantity').value;
    const poids = document.getElementById('poids').value;
    const prix = document.getElementById('prix').value;
    const fournisseur = document.getElementById('fournisseur').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const description = document.getElementById('description').value;

    // Make API call with the entered data
    const requestData = {
        token: getCookie('token'),
        sku: sku,
        name: name,
        categoryID: categoryID,
        quantity: quantity,
        poids: poids,
        prix: prix,
        fournisseur: fournisseur,
        imageUrl: imageUrl,
        description: description
    };

    fetch('/api/addProduct', {
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
