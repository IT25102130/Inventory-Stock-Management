document.addEventListener('DOMContentLoaded', () => {

    /* =====================================
       ACTIVE SIDEBAR LINK
    ===================================== */
    const links = document.querySelectorAll('.sidebar-nav a');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        const linkPath = link.getAttribute('href');

        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });


    /* =====================================
       SAFE ELEMENT CHECK (for multi-pages)
    ===================================== */
    const productForm = document.getElementById('productForm');
    if (!productForm) return; // Stop if not on product page


    /* =====================================
       ELEMENTS
    ===================================== */
    const productTableBody = document.getElementById('productTableBody');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const formTitle = document.getElementById('formTitle');

    let isEditing = false;


    /* =====================================
       LOAD PRODUCTS
    ===================================== */
    async function loadProducts() {
        try {
            const response = await fetch('/api/product');
            const products = await response.json();

            productTableBody.innerHTML = '';

            products.forEach(product => {
                const tr = document.createElement('tr');
                const priceFormatted = (product.price !== null && product.price !== undefined) 
                    ? Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                    : '0.00';

                tr.innerHTML = `
                    <td>${product.productName}</td>
                    <td>${product.categoryName}</td>
                    <td>Rs. ${priceFormatted}</td>
                    <td>
                        <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;

                productTableBody.appendChild(tr);
            });

            try {
                const countResponse = await fetch('/api/product/count');
                const count = await countResponse.json();
                document.getElementById('totalProducts').textContent = count;
            } catch (countError) {
                console.error('Error loading product count, fallback to length:', countError);
                document.getElementById('totalProducts').textContent = products.length;
            }

        } catch (error) {
            console.error('Error loading products:', error);
        }
    }


    /* =====================================
       CREATE / UPDATE
    ===================================== */
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('productId').value;

        const productData = {
            productName: document.getElementById('productName').value,
            categoryName: document.getElementById('categoryName').value,
            price: parseFloat(document.getElementById('price').value)
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/product/${id}` : '/api/product';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
                resetForm();
                loadProducts();
            } else {
                alert('Error saving product');
            }

        } catch (error) {
            console.error('Error saving product:', error);
        }
    });


    /* =====================================
       EDIT
    ===================================== */
    window.editProduct = async (id) => {
        try {
            const response = await fetch(`/api/product/${id}`);
            const product = await response.json();

            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.productName;
            document.getElementById('categoryName').value = product.categoryName;
            document.getElementById('price').value = product.price;

            isEditing = true;
            submitBtn.textContent = 'Update Product';
            formTitle.textContent = 'Edit Product';

        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };


    /* =====================================
       DELETE
    ===================================== */
    window.deleteProduct = async (id) => {

        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/product/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadProducts();
            } else {
                alert('Error deleting product');
            }

        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };


    /* =====================================
       RESET FORM
    ===================================== */
    function resetForm() {
        productForm.reset();
        document.getElementById('productId').value = '';
        isEditing = false;
        submitBtn.textContent = 'Add Product';
        formTitle.textContent = 'Add New Product';
    }

    clearBtn.addEventListener('click', resetForm);


    /* =====================================
       INIT
    ===================================== */
    loadProducts();

});