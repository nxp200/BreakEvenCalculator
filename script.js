document.addEventListener('DOMContentLoaded', () => {
    const fixedCostsInput = document.getElementById('fixed-costs');
    const variableCostInput = document.getElementById('variable-cost');
    const sellingPriceInput = document.getElementById('selling-price');
    const calculateBtn = document.getElementById('calculate-btn');
    const showExampleBtn = document.getElementById('show-example-btn');
    const resultContainer = document.getElementById('result-container');
    const resultValue = document.getElementById('result-value');
    const resultMessage = document.getElementById('result-message');
    
    // Chart variables
    let breakEvenChart = null;
    const ctx = document.getElementById('break-even-chart').getContext('2d');
    
    // Error elements
    const fixedCostsError = document.getElementById('fixed-costs-error');
    const variableCostError = document.getElementById('variable-cost-error');
    const sellingPriceError = document.getElementById('selling-price-error');
    
    // Initially hide the result
    resultContainer.style.opacity = '0.5';
    
    // Add event listeners for input validation
    [fixedCostsInput, variableCostInput, sellingPriceInput].forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });
    });
    
    // Calculate button event listener
    calculateBtn.addEventListener('click', calculateBreakEven);
    
    // Show example button event listener
    showExampleBtn.addEventListener('click', () => {
        // Populate with realistic example values
        fixedCostsInput.value = '10000';
        variableCostInput.value = '15';
        sellingPriceInput.value = '35';
        
        // Clear any previous errors
        fixedCostsError.textContent = '';
        variableCostError.textContent = '';
        sellingPriceError.textContent = '';
        
        // Calculate with example values
        calculateBreakEven();
    });
    
    // Input validation function
    function validateInput(input) {
        const value = parseFloat(input.value);
        let errorElement;
        
        switch(input.id) {
            case 'fixed-costs':
                errorElement = fixedCostsError;
                break;
            case 'variable-cost':
                errorElement = variableCostError;
                break;
            case 'selling-price':
                errorElement = sellingPriceError;
                break;
        }
        
        // Clear previous error
        errorElement.textContent = '';
        
        // Check if input is empty
        if (input.value.trim() === '') {
            return false;
        }
        
        // Check if input is not a number or is negative
        if (isNaN(value) || value <= 0) {
            errorElement.textContent = 'Please enter a positive number';
            return false;
        }
        
        return true;
    }
    
    // Break-even calculation function
    function calculateBreakEven() {
        // Validate all inputs first
        const isFixedCostsValid = validateInput(fixedCostsInput);
        const isVariableCostValid = validateInput(variableCostInput);
        const isSellingPriceValid = validateInput(sellingPriceInput);
        
        // If all inputs are valid, calculate break-even point
        if (isFixedCostsValid && isVariableCostValid && isSellingPriceValid) {
            const fixedCosts = parseFloat(fixedCostsInput.value);
            const variableCost = parseFloat(variableCostInput.value);
            const sellingPrice = parseFloat(sellingPriceInput.value);
            
            // Check if selling price is greater than variable cost
            if (sellingPrice <= variableCost) {
                sellingPriceError.textContent = 'Selling price must be greater than variable cost';
                return;
            }
            
            // Calculate break-even point
            const breakEvenPoint = fixedCosts / (sellingPrice - variableCost);
            const roundedBreakEvenPoint = Math.ceil(breakEvenPoint);
            
            // Display the result
            resultContainer.style.opacity = '1';
            resultValue.textContent = roundedBreakEvenPoint.toLocaleString();
            
            // Add a helpful message
            const contribution = sellingPrice - variableCost;
            resultMessage.textContent = `Each unit contributes $${contribution.toFixed(2)} towards fixed costs.`;
            
            // Add animation for result display
            resultValue.classList.add('highlight');
            setTimeout(() => {
                resultValue.classList.remove('highlight');
            }, 1500);
            
            // Create or update the chart
            createChart(fixedCosts, variableCost, sellingPrice, roundedBreakEvenPoint);
        }
    }
    
    // Function to create or update the break-even chart
    function createChart(fixedCosts, variableCost, sellingPrice, breakEvenPoint) {
        // Calculate data for the chart
        // We'll plot from 0 to 2x the break-even point for a good visualization
        const maxUnits = Math.ceil(breakEvenPoint * 2);
        const unitSteps = 10;
        const labels = [];
        const fixedCostsData = [];
        const totalCostsData = [];
        const revenueData = [];
        
        // Generate data points
        for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / unitSteps)) {
            labels.push(units);
            fixedCostsData.push(fixedCosts);
            totalCostsData.push(fixedCosts + (variableCost * units));
            revenueData.push(sellingPrice * units);
        }
        
        // Add break-even point exactly
        if (!labels.includes(breakEvenPoint)) {
            const insertIndex = labels.findIndex(units => units > breakEvenPoint);
            if (insertIndex !== -1) {
                labels.splice(insertIndex, 0, breakEvenPoint);
                fixedCostsData.splice(insertIndex, 0, fixedCosts);
                totalCostsData.splice(insertIndex, 0, fixedCosts + (variableCost * breakEvenPoint));
                revenueData.splice(insertIndex, 0, sellingPrice * breakEvenPoint);
            }
        }
        
        // Sort the data points by units
        const sortedData = labels.map((units, i) => ({
            units,
            fixedCosts: fixedCostsData[i],
            totalCosts: totalCostsData[i],
            revenue: revenueData[i]
        })).sort((a, b) => a.units - b.units);
        
        // Update sorted arrays
        labels.length = 0;
        fixedCostsData.length = 0;
        totalCostsData.length = 0;
        revenueData.length = 0;
        
        sortedData.forEach(point => {
            labels.push(point.units);
            fixedCostsData.push(point.fixedCosts);
            totalCostsData.push(point.totalCosts);
            revenueData.push(point.revenue);
        });
        
        // Destroy existing chart if it exists
        if (breakEvenChart) {
            breakEvenChart.destroy();
        }
        
        // Prepare data for break-even point visualization
        
        // Create new chart
        breakEvenChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Fixed Costs',
                        data: fixedCostsData,
                        borderColor: '#FFA726',
                        backgroundColor: 'rgba(255, 167, 38, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Total Costs',
                        data: totalCostsData,
                        borderColor: '#EF5350',
                        backgroundColor: 'rgba(239, 83, 80, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: '#66BB6A',
                        backgroundColor: 'rgba(102, 187, 106, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Break-Even Point',
                        data: labels.map(units => units === breakEvenPoint ? fixedCosts + (variableCost * breakEvenPoint) : null),
                        backgroundColor: '#3F51B5',
                        borderColor: '#3F51B5',
                        borderWidth: 0,
                        pointRadius: labels.map(units => units === breakEvenPoint ? 8 : 0),
                        pointHoverRadius: labels.map(units => units === breakEvenPoint ? 10 : 0),
                        pointStyle: 'rectRot',
                        fill: false,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                layout: {
                    padding: {
                        top: 20,
                        right: 20,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '$' + context.parsed.y.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Units'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Add custom CSS for result highlight animation
    const style = document.createElement('style');
    style.textContent = `
        .highlight {
            animation: pulse 1.5s;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});
