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

// Initialize with one ingredient
addIngredient();

// Add event listeners for servings and margin
document.getElementById('servings').addEventListener('change', updateCalculations);
document.getElementById('margin').addEventListener('change', updateCalculations);
document.getElementById('add-ingredient').addEventListener('click', addIngredient);