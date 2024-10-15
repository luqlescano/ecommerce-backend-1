const socket = io();

const sendProductId = (productId) => {
    socket.emit('productClicked', productId);
}

socket.on('productList', function(productList) {
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = '';
    productList.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <th scope="row">${product.id}</th>
            <td>${product.title}</td>
            <td>${product.description}</td>
            <td>${product.code}</td>
            <td>${product.price}</td>
            <td>${product.status ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>'}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm delete-product-btn" data-product-id="${product.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        const deleteButton = tr.querySelector('.delete-product-btn');
        deleteButton.addEventListener('click', () => {
            sendProductId(product.id);
        });

        productListElement.appendChild(tr);
    });
});

const sendFormData = (event) => {
    event.preventDefault();

    const formData = {
        id: '',
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: document.getElementById('price').value,
        status: true,
        stock: document.getElementById('stock').value,
        category: document.getElementById('category').value,
        thumbnails: []
    };

    socket.emit('addProduct', formData);

    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('code').value = '';
    document.getElementById('price').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('category').value = '';
};

document.getElementById('product-form').addEventListener('submit', sendFormData);