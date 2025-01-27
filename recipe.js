let ingredients = [];

function addIngredient() {
    const id = Date.now(); // unique ID for each ingredient
    ingredients.push({
        id: id,
        name: '',
        quantity: 0,
        unit: 'g',
        costPerUnit: 0
    });
    renderIngredients();
    updateCalculations();
}

function removeIngredient(id) {
    ingredients = ingredients.filter(ing => ing.id !== id);
    renderIngredients();
    updateCalculations();
}

function updateIngredient(id, field, value) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (ingredient) {
        ingredient[field] = value;
        updateCalculations();
    }
}

function renderIngredients() {
    const container = document.getElementById('ingredients');
    container.innerHTML = ingredients.map(ing => `
        <div class="ingredient-row">
            <input 
                type="text" 
                placeholder="Ingredient name"
                value="${ing.name}"
                onchange="updateIngredient(${ing.id}, 'name', this.value)"
            >
            <input 
                type="number" 
                value="${ing.quantity}"
                onchange="updateIngredient(${ing.id}, 'quantity', parseFloat(this.value))"
            >
            <select 
                onchange="updateIngredient(${ing.id}, 'unit', this.value)"
            >
                <option value="g" ${ing.unit === 'g' ? 'selected' : ''}>g</option>
                <option value="kg" ${ing.unit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
                <option value="L" ${ing.unit === 'L' ? 'selected' : ''}>L</option>
                <option value="unit" ${ing.unit === 'unit' ? 'selected' : ''}>unit</option>
            </select>
            <input 
                type="number" 
                placeholder="Cost/unit"
                value="${ing.costPerUnit}"
                onchange="updateIngredient(${ing.id}, 'costPerUnit', parseFloat(this.value))"
            >
            <button class="remove-ingredient" data-id="${ing.id}">Remove</button>

        </div>
    `).join('');
}

function calculateTotalCost() {
    return ingredients.reduce((total, ing) => 
        total + (ing.quantity * ing.costPerUnit), 0);
}

function updateCalculations() {
    const servings = parseFloat(document.getElementById('servings').value) || 1;
    const margin = parseFloat(document.getElementById('margin').value) || 70;
    
    const totalCost = calculateTotalCost();
    const costPerServing = totalCost / servings;
    const suggestedPrice = costPerServing / (1 - (margin / 100));

    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
    document.getElementById('costPerServing').textContent = costPerServing.toFixed(2);
    document.getElementById('suggestedPrice').textContent = suggestedPrice.toFixed(2);
}

let supplierPrices = {};

function addSupplierPrice() {
    const priceContainer = document.getElementById('supplier-prices');
    const id = Date.now();
    
    const row = document.createElement('div');
    row.className = 'supplier-row';
    row.innerHTML = `
        <input type="text" placeholder="Ingredient name" class="ingredient-name">
        <input type="number" placeholder="Price" class="price" style="width: 80px">
        <select class="unit">
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="unit">unit</option>
        </select>
        <button class="update-price">Update</button>
        <div class="price-history"></div>
    `;

    priceContainer.appendChild(row);

    row.querySelector('.update-price').addEventListener('click', () => {
        const name = row.querySelector('.ingredient-name').value;
        const price = parseFloat(row.querySelector('.price').value);
        const unit = row.querySelector('.unit').value;
        updateSupplierPrice(name, price, unit);
    });
}

function updateSupplierPrice(ingredientName, newPrice, unit) {
    if (!supplierPrices[ingredientName]) {
        supplierPrices[ingredientName] = {
            currentPrice: newPrice,
            history: [],
            unit: unit
        };
    } else {
        // Store old price in history
        supplierPrices[ingredientName].history.push({
            date: new Date(),
            price: supplierPrices[ingredientName].currentPrice
        });
        supplierPrices[ingredientName].currentPrice = newPrice;
    }

    updatePriceHistory(ingredientName);
    checkMarginImpact();
    updateCalculations();
}

function updatePriceHistory(ingredientName) {
    const rows = document.querySelectorAll('.supplier-row');
    for (let row of rows) {
        if (row.querySelector('.ingredient-name').value === ingredientName) {
            const historyDiv = row.querySelector('.price-history');
            const history = supplierPrices[ingredientName].history;
            if (history.length > 0) {
                const lastPrice = history[history.length - 1];
                const priceDiff = supplierPrices[ingredientName].currentPrice - lastPrice.price;
                const sign = priceDiff >= 0 ? '+' : '';
                historyDiv.textContent = `Previous: $${lastPrice.price.toFixed(2)} (${sign}${priceDiff.toFixed(2)})`;
            }
        }
    }
}
function calculateActualMargin() {
    const totalCost = calculateTotalCost();
    const suggestedPrice = parseFloat(document.getElementById('suggestedPrice').textContent);
    
    if (totalCost === 0 || !suggestedPrice) return 100;
    
    return ((suggestedPrice - totalCost) / suggestedPrice) * 100;
}

function checkMarginImpact() {
    const alertsDiv = document.getElementById('margin-alerts');
    alertsDiv.innerHTML = '';
    
    const targetMargin = parseFloat(document.getElementById('margin').value) || 70;
    const currentMargin = calculateActualMargin();
    
    if (currentMargin < targetMargin) {
        alertsDiv.innerHTML = `
            <div>⚠️ Warning: Current margin (${currentMargin.toFixed(1)}%) is below target (${targetMargin}%)</div>
        `;
    }
}

// Update your existing updateIngredient function to use supplier prices
function updateIngredient(id, field, value) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (ingredient) {
        ingredient[field] = value;
        if (field === 'name' && supplierPrices[value]) {
            ingredient.costPerUnit = supplierPrices[value].currentPrice;
        }
        updateCalculations();
        checkMarginImpact();
    }
}
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with one ingredient
    addIngredient();

    // Add event listeners
    document.getElementById('add-ingredient').addEventListener('click', addIngredient);
    document.getElementById('add-supplier-price').addEventListener('click', addSupplierPrice);
    document.getElementById('servings').addEventListener('change', updateCalculations);
    document.getElementById('margin').addEventListener('change', updateCalculations);

    // Delegate listener for remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-ingredient')) {
            const id = parseInt(e.target.dataset.id);
            removeIngredient(id);
        }
    });
});