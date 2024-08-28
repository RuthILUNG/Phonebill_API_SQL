function phoneBillManager() {
    return {
        pricePlans: [],
        newPlan: { name: '', sms_cost: 0, call_cost: 0 },
        updatePlan: { name: '', sms_cost: 0, call_cost: 0 },
        deletePlan: { id: 0 },
        billData: { price_plan: '', actions: '' },
        billResult: null,

        init() {
            console.log("PhoneBillManager initialized");
            this.fetchPricePlans();
        },

        async fetchPricePlans() {
            try {
                const response = await fetch('/api/price_plans/');
                const data = await response.json();
                if (Array.isArray(data)) {
                    this.pricePlans = data;
                } else {
                    console.error('Unexpected response format');
                }
            } catch (error) {
                console.error('Error fetching price plans:', error);
            }
        },

        async createPricePlan() {
            try {
                const response = await fetch('/api/price_plan/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newPlan)
                });
                if (response.ok) {
                    this.newPlan = { name: '', sms_cost: 0, call_cost: 0 };  // Clear form
                    this.fetchPricePlans();  // Refresh the list
                    alert('Price plan created successfully!');
                }
            } catch (error) {
                console.error('Failed to create price plan', error);
                alert('Failed to create price plan');
            }
        },

        async updatePricePlan() {
            try {
                const response = await fetch('/api/price_plan/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.updatePlan)
                });
                if (response.ok) {
                    this.updatePlan = { name: '', sms_cost: 0, call_cost: 0 };  // Clear form
                    this.fetchPricePlans();  // Refresh the list
                    alert('Price plan updated successfully!');
                }
            } catch (error) {
                console.error('Failed to update price plan', error);
                alert('Failed to update price plan');
            }
        },

        async deletePricePlan() {
            try {
                const response = await fetch('/api/price_plan/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.deletePlan)
                });
                if (response.ok) {
                    this.deletePlan = { id: 0 };  // Clear form
                    this.fetchPricePlans();  // Refresh the list
                    alert('Price plan deleted successfully!');
                }
            } catch (error) {
                console.error('Failed to delete price plan', error);
                alert('Failed to delete price plan');
            }
        },

        async calculatePhoneBill() {
            try {
                const response = await fetch('/api/phonebill/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.billData)
                });
                if (response.ok) {
                    this.billResult = await response.json();
                } else {
                    console.error('Failed to calculate phone bill');
                    alert('Failed to calculate phone bill');
                }
            } catch (error) {
                console.error('Error calculating phone bill:', error);
            }
        }
    };
}
