document.addEventListener('DOMContentLoaded', () => {

    /* =====================================
       ACTIVE SIDEBAR LINK
    ===================================== */
    const links = document.querySelectorAll('.sidebar-nav .nav-item');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });

    /* =====================================
       ELEMENTS
    ===================================== */
    const stockForm = document.getElementById('stockForm');
    const stockTableBody = document.getElementById('stockTableBody');
    const productSelect = document.getElementById('productSelect');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const formTitle = document.getElementById('formTitle');
    const totalItemsElement = document.getElementById('totalItems');
    const lowStockCountElement = document.getElementById('lowStockCount');

    let products = {};
    let isEditing = false;

    /* =====================================
       LOAD PRODUCTS
    ===================================== */
    async function loadProducts() {
        try {
            const response = await fetch('/api/product');
            const data = await response.json();

            productSelect.innerHTML = '<option value="">Select Product</option>';

            data.forEach(product => {
                products[product.id] = product.productName;

                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productName;

                productSelect.appendChild(option);
            });

            loadStock();

        } catch (error) {
            console.error('Error loading products:', error);
            showAlert('Failed to load products', 'error');
        }
    }

    /* =====================================
       LOAD STOCK
    ===================================== */
    async function loadStock() {
        try {
            const response = await fetch('/api/inventory');
            const stocks = await response.json();

            stockTableBody.innerHTML = '';

            let totalItems = 0;
            let lowStockItems = 0;

            let renderedCount = 0;
            stocks.forEach((stock) => {
                totalItems += stock.quantity;

                // Do not display negative stock adjustments (reductions from transactions) in the table
                if (stock.quantity < 0) {
                    return;
                }

                const tr = document.createElement('tr');
                const isLowStock = stock.quantity < 10;
                if (isLowStock) lowStockItems++;

                const lastUpdated = stock.lastUpdated
                    ? new Date(stock.lastUpdated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : 'N/A';

                const lowStockBadge = isLowStock
                    ? '<span class="badge-low"><i class="fas fa-exclamation-triangle"></i> Low Stock</span>'
                    : '';

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-box" style="color: var(--primary);"></i>
                            <strong>${stock.productName || products[stock.productId] || 'Unknown'}</strong>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <strong>${stock.quantity} units</strong>
                            ${lowStockBadge}
                        </div>
                    </td>
                    <td>
                        <small>${lastUpdated}</small>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="editStock(${stock.id})" title="Edit stock">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn-delete" onclick="deleteStock(${stock.id})" title="Delete stock">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                `;

                // Add animation delay
                tr.style.animation = `slideUp 0.4s ease-out ${renderedCount * 0.05}s both`;
                renderedCount++;
                stockTableBody.appendChild(tr);
            });

            // Update statistics
            if (totalItemsElement) {
                totalItemsElement.textContent = totalItems;
            }
            if (lowStockCountElement) {
                lowStockCountElement.textContent = lowStockItems;
            }

            // Aggregate quantity by product
            const productTotals = {};
            
            // Pre-fill all loaded products with 0
            if (products) {
                Object.values(products).forEach(prodName => {
                    productTotals[prodName] = 0;
                });
            }
            
            stocks.forEach(stock => {
                const prodName = stock.productName || products[stock.productId] || 'Unknown';
                if (productTotals[prodName] === undefined) {
                    productTotals[prodName] = 0;
                }
                productTotals[prodName] += stock.quantity;
            });

            // Render aggregated stock summary
            const stockSummaryContainer = document.getElementById('stockSummaryContainer');
            if (stockSummaryContainer) {
                stockSummaryContainer.innerHTML = '';
                
                Object.keys(productTotals).forEach(prodName => {
                    const totalQty = productTotals[prodName];
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'summary-item';
                    
                    const isLow = totalQty < 10;
                    const lowBadge = isLow 
                        ? ' <span class="badge-low" style="padding: 2px 6px; font-size: 10px; margin-left: 6px;"><i class="fas fa-exclamation-triangle"></i> Low</span>'
                        : '';
                    
                    itemDiv.innerHTML = `
                        <div class="summary-icon" style="color: ${isLow ? 'var(--danger)' : 'var(--primary)'}; background: ${isLow ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-light)'};">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-name" title="${prodName}">${prodName}${lowBadge}</span>
                            <span class="summary-total" style="color: ${isLow ? 'var(--danger)' : 'var(--primary)'};">${totalQty} units</span>
                        </div>
                    `;
                    stockSummaryContainer.appendChild(itemDiv);
                });
            }

        } catch (error) {
            console.error('Error loading stock:', error);
            showAlert('Failed to load stock data', 'error');
        }
    }

    /* =====================================
       CREATE / UPDATE
    ===================================== */
    stockForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('stockId').value;
        const productId = document.getElementById('productSelect').value;
        const quantity = document.getElementById('quantity').value;

        // Validation
        if (!productId || quantity === '' || quantity < 0) {
            showAlert('Please fill all fields with valid values', 'error');
            return;
        }

        const stockData = {
            productId: parseInt(productId),
            quantity: parseInt(quantity)
        };

        try {
            submitBtn.disabled = true;
            const originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>';

            let response;

            if (id) {
                // UPDATE
                response = await fetch(`/api/inventory/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(stockData)
                });
            } else {
                // CREATE
                response = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(stockData)
                });
            }

            if (response.ok) {
                const message = id ? 'Stock updated successfully!' : 'Stock added successfully!';
                showAlert(message, 'success');
                resetForm();
                loadStock();
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Operation failed!', 'error');
            }

        } catch (error) {
            console.error('Error saving stock:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
        }
    });

    /* =====================================
       EDIT
    ===================================== */
    window.editStock = async (id) => {
        try {
            const response = await fetch(`/api/inventory/${id}`);
            const stock = await response.json();

            document.getElementById('stockId').value = stock.id;
            document.getElementById('productSelect').value = stock.productId;
            document.getElementById('quantity').value = stock.quantity;

            isEditing = true;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Update Stock</span>';
            formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Stock';

            // Scroll to form
            document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Error loading stock:', error);
            showAlert('Failed to load stock details', 'error');
        }
    };

    /* =====================================
       DELETE
    ===================================== */
    window.deleteStock = async (id) => {
        const confirmDelete = confirm('Are you sure you want to delete this stock? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('Stock deleted successfully!', 'success');
                loadStock();
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Delete failed!', 'error');
            }

        } catch (error) {
            console.error('Error deleting stock:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        }
    };

    /* =====================================
       RESET FORM
    ===================================== */
    function resetForm() {
        stockForm.reset();
        document.getElementById('stockId').value = '';
        isEditing = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Save Stock</span>';
        formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add / Update Stock';
    }

    clearBtn.addEventListener('click', resetForm);

    /* =====================================
       SHOW ALERT (Toast Notification)
    ===================================== */
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        `;

        const typeConfig = {
            success: {
                bg: '#ECFDF5',
                color: '#059669',
                icon: 'fa-check-circle',
                border: '#10B981'
            },
            error: {
                bg: '#FEF2F2',
                color: '#DC2626',
                icon: 'fa-exclamation-circle',
                border: '#EF4444'
            },
            info: {
                bg: '#EFF6FF',
                color: '#2563EB',
                icon: 'fa-info-circle',
                border: '#2563EB'
            }
        };

        const config = typeConfig[type] || typeConfig.info;
        alertDiv.style.background = config.bg;
        alertDiv.style.color = config.color;
        alertDiv.style.border = `2px solid ${config.border}`;

        alertDiv.innerHTML = `
            <i class="fas ${config.icon}" style="font-size: 18px;"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    }

    /* =====================================
       INIT
    ===================================== */
    loadProducts();

});