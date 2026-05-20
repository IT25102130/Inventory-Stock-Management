class TransactionManager {
    constructor() {
        this.transactionForm = document.getElementById('transactionForm');
        this.transactionIdInput = document.getElementById('transactionId');
        this.transactionTableBody = document.getElementById('transactionTableBody');
        this.productSelect = document.getElementById('productSelect');
        this.supplierSelect = document.getElementById('supplierSelect');
        this.clearBtn = document.getElementById('clearBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.formTitle = document.getElementById('formTitle');
        this.totalTransactionsElement = document.getElementById('totalTransactions');
        this.totalValueElement = document.getElementById('totalValue');

        this.products = {};
        this.suppliers = {};

        this.init();
    }

    async init() {
        this.setActiveSidebarLink();
        this.addEventListeners();
        await this.loadInitialData();
    }

    setActiveSidebarLink() {
        const links = document.querySelectorAll('.sidebar-nav .nav-item');
        const currentPath = window.location.pathname;

        links.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath)) {
                link.classList.add('active');
            }
        });
    }

    addEventListeners() {
        this.transactionForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.clearBtn.addEventListener('click', () => this.resetForm());
    }

    async loadInitialData() {
        try {
            const [pRes, sRes] = await Promise.all([
                fetch('/api/product'),
                fetch('/api/supplier')
            ]);

            const pData = await pRes.json();
            const sData = await sRes.json();

            pData.forEach(p => {
                this.products[p.id] = p.productName;
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.productName;
                this.productSelect.appendChild(opt);
            });

            sData.forEach(s => {
                this.suppliers[s.id] = s.name;
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                this.supplierSelect.appendChild(opt);
            });

            await this.loadTransactions();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showAlert('Failed to load initial data', 'error');
        }
    }

    async loadTransactions() {
        try {
            const response = await fetch('/api/transaction');
            const data = await response.json();
            this.transactionTableBody.innerHTML = '';

            let totalValue = 0;

            data.forEach((t, index) => {
                totalValue += t.totalPrice;

                const tr = document.createElement('tr');

                const transactionDate = new Date(t.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const formattedPrice = 'Rs. ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(t.totalPrice);

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-box" style="color: var(--primary);"></i>
                            <strong>${t.productName || this.products[t.productId] || t.productId}</strong>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-truck" style="color: var(--primary);"></i>
                            <strong>${t.supplierName || this.suppliers[t.supplierId] || t.supplierId}</strong>
                        </div>
                    </td>
                    <td><span style="font-weight: 600;">${t.quantity} units</span></td>
                    <td><span style="color: var(--primary); font-weight: 600;">${formattedPrice}</span></td>
                    <td><small>${transactionDate}</small></td>
                    <td>
                        <button class="btn-edit" onclick="transactionManager.editTransaction(${t.id})" title="Edit transaction">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn-delete" onclick="transactionManager.deleteTransaction(${t.id})" title="Delete transaction">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                `;

                // Add animation delay
                tr.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s both`;
                this.transactionTableBody.appendChild(tr);
            });

            // Update statistics
            if (this.totalTransactionsElement) {
                this.totalTransactionsElement.textContent = data.length;
            }
            if (this.totalValueElement) {
                const formattedTotal = 'Rs. ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(totalValue);
                this.totalValueElement.textContent = formattedTotal;
            }

        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showAlert('Failed to load transactions', 'error');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const id = this.transactionIdInput.value;
        const transactionData = {
            productId: parseInt(this.productSelect.value),
            supplierId: parseInt(this.supplierSelect.value),
            quantity: parseInt(document.getElementById('quantity').value)
        };

        // Validation
        if (!transactionData.productId || !transactionData.supplierId || transactionData.quantity < 1) {
            this.showAlert('Please fill all fields with valid values', 'error');
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/transaction/${id}` : '/api/transaction';

        // ✅ FIXED: Declare originalHtml BEFORE try block
        const originalHtml = this.submitBtn.innerHTML;

        try {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                const message = id ? 'Transaction updated successfully!' : 'Transaction recorded and stock updated!';
                this.showAlert(message, 'success');
                this.resetForm();
                await this.loadTransactions();
            } else {
                const errorData = await response.json();
                this.showAlert(errorData.message || 'Error saving transaction', 'error');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showAlert('A network error occurred. Please try again.', 'error');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = originalHtml;
        }
    }

    async editTransaction(id) {
        try {
            const response = await fetch(`/api/transaction/${id}`);
            if (response.ok) {
                const transaction = await response.json();

                this.transactionIdInput.value = transaction.id;
                this.productSelect.value = transaction.productId;
                this.supplierSelect.value = transaction.supplierId;
                document.getElementById('quantity').value = transaction.quantity;

                this.submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Update Transaction</span>';
                this.formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Transaction';

                // Scroll to form
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Error fetching transaction for edit:', error);
            this.showAlert('Failed to load transaction details', 'error');
        }
    }

    async deleteTransaction(id) {
        const confirmDelete = confirm('Are you sure you want to delete this transaction? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/transaction/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Transaction deleted successfully!', 'success');
                await this.loadTransactions();
            } else {
                const errorData = await response.json();
                this.showAlert(errorData.message || 'Error deleting transaction', 'error');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showAlert('A network error occurred. Please try again.', 'error');
        }
    }

    resetForm() {
        this.transactionForm.reset();
        this.transactionIdInput.value = '';
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Record Transaction</span>';
        this.formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Record New Transaction';
    }

    showAlert(message, type = 'info') {
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
}

let transactionManager;
document.addEventListener('DOMContentLoaded', () => {
    transactionManager = new TransactionManager();
});