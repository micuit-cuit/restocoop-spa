function submitForm() {
    // Retrieve values from input fields
    const sku = document.getElementById('sku').value;
    const name = document.getElementById('name').value;
    const categoryID = document.getElementById('categoryID').value;
    const quantity = document.getElementById('quantity').value;
    const poids = document.getElementById('poids').value;
    const prix = document.getElementById('prix').value;
    const fournisseurID = document.getElementById('fournisseurID').value;
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
        fournisseurID: fournisseurID,
        imageUrl: imageUrl,
        description: description
    };
    //convert object to string url variable
    const urlParams = urlVarsEncode(requestData)
    fetch('/api/addProduct?' + urlParams, {
        method: 'GET'
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
function urlVarsEncode (urlVars) {
    let urlVarsEncoded = '';
    for (const key in urlVars) {
        urlVarsEncoded += `${key}=${encodeURIComponent(urlVars[key])}&`;
    }
    return urlVarsEncoded.slice(0, -1);
}