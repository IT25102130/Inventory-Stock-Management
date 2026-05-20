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
    const supplierForm = document.getElementById('supplierForm');
    if (!supplierForm) return;

    /* =====================================
       ELEMENTS
    ===================================== */
    const supplierTableBody = document.getElementById('supplierTableBody');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const formTitle = document.getElementById('formTitle');

    let isEditing = false;

    /* =====================================
       LOAD SUPPLIERS
    ===================================== */
    async function loadSuppliers() {
        try {
            const response = await fetch('/api/supplier');
            const suppliers = await response.json();

            supplierTableBody.innerHTML = '';

            suppliers.forEach(supplier => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${supplier.name || ''}</td>
                    <td>${supplier.phone || ''}</td>
                    <td>${supplier.email || ''}</td>
                    <td>${supplier.address || ''}</td>
                    <td>
                        <button class="btn-edit" onclick="editSupplier(${supplier.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteSupplier(${supplier.id})">Delete</button>
                    </td>
                `;

                supplierTableBody.appendChild(tr);
            });

            document.getElementById('totalSuppliers').textContent = suppliers.length;

        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    /* =====================================
       CREATE / UPDATE
    ===================================== */
    supplierForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('supplierId').value;

        const supplierData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/supplier/${id}` : '/api/supplier';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });

            if (response.ok) {
                alert(isEditing ? 'Supplier updated successfully!' : 'Supplier added successfully!');
                resetForm();
                loadSuppliers();
            } else {
                alert('Error saving supplier');
            }

        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    });

    /* =====================================
       EDIT
    ===================================== */
    window.editSupplier = async (id) => {
        try {
            const response = await fetch(`/api/supplier/${id}`);
            const supplier = await response.json();

            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('name').value = supplier.name;
            document.getElementById('phone').value = supplier.phone;
            document.getElementById('email').value = supplier.email;
            document.getElementById('address').value = supplier.address;

            isEditing = true;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Update Supplier</span>';
            formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Supplier';

        } catch (error) {
            console.error('Error fetching supplier:', error);
        }
    };

    /* =====================================
       DELETE
    ===================================== */
    window.deleteSupplier = async (id) => {

        if (!confirm('Are you sure you want to delete this supplier?')) return;

        try {
            const response = await fetch(`/api/supplier/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadSuppliers();
            } else {
                alert('Error deleting supplier');
            }

        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    /* =====================================
       RESET FORM
    ===================================== */
    function resetForm() {
        supplierForm.reset();
        document.getElementById('supplierId').value = '';
        isEditing = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Add Supplier</span>';
        formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Supplier';
    }

    clearBtn.addEventListener('click', resetForm);

    /* =====================================
       INIT
    ===================================== */
    loadSuppliers();

});
