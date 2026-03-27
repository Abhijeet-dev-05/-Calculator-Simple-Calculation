// Calculator DOM elements
const displayCurrent = document.getElementById('current');
const displayPrevious = document.getElementById('previous');
const numberBtns = document.querySelectorAll('.number');
const operatorBtns = document.querySelectorAll('.operator');
const equalsBtn = document.querySelector('.equals');
const clearBtn = document.querySelector('[data-action="clear"]');
const deleteBtn = document.querySelector('[data-action="delete"]');
const percentBtn = document.querySelector('[data-action="percent"]');

// Internal State
let currentOperand = '0';
let previousOperand = '';
let operation = undefined;

// Actions
function clear() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
}

function deleteNumber() {
    if (currentOperand === 'Error') {
        clear();
        return;
    }
    if (currentOperand.length === 1) {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.toString().slice(0, -1);
    }
}

function appendNumber(number) {
    if (currentOperand === 'Error') clear();
    // Don't allow multiple decimal points
    if (number === '.' && currentOperand.includes('.')) return;
    
    // Replace initial 0 if we start typing Unless it's a decimal dot
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number.toString();
    } else {
        currentOperand = currentOperand.toString() + number.toString();
    }
}

function chooseOperation(op) {
    if (currentOperand === 'Error') return;
    // Don't do anything if no numbers pressed
    if (currentOperand === '' && operation === undefined) return;
    
    // If we only have previous and user tries changing operator
    if (currentOperand === '') {
        operation = op;
        return;
    }
    
    // If we have both, calculate before chained ops
    if (previousOperand !== '') {
        calculate();
    }
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
}

function calculate() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    
    // Safety exit
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '−':
        case '-':
            computation = prev - current;
            break;
        case '×':
        case '*':
            computation = prev * current;
            break;
        case '÷':
        case '/':
            if (current === 0) {
                computation = "Error"; // Zero Division Protection
            } else {
                computation = prev / current;
            }
            break;
        default:
            return;
    }
    
    if (computation !== "Error") {
        // Handle floating point precision anomalies by rounding beautifully
        computation = Math.round(computation * 100000000) / 100000000;
    }
    
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
}

function calculatePercent() {
    if (currentOperand === 'Error' || currentOperand === '') return;
    const current = parseFloat(currentOperand);
    if (isNaN(current)) return;
    
    currentOperand = (current / 100).toString();
}

// Display parsing logic
function getDisplayNumber(number) {
    if (number === 'Error') return number;
    if (number === '-' || number === '') return number;
    
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    
    let integerDisplay;
    if (isNaN(integerDigits)) {
        integerDisplay = ''; // if starting blank
    } else {
        // Enforce localized comma separators on big numbers via standard API
        integerDisplay = integerDigits.toLocaleString('en', {
            maximumFractionDigits: 0
        });
    }
    
    if (decimalDigits != null) {
        return `${integerDisplay}.${decimalDigits}`;
    } else {
        return integerDisplay;
    }
}

// GUI Redraw
function updateDisplay() {
    displayCurrent.innerText = getDisplayNumber(currentOperand) || '0';
    if (operation != null) {
        displayPrevious.innerText = `${getDisplayNumber(previousOperand)} ${operation}`;
    } else {
        displayPrevious.innerText = '';
    }
}

// Bind GUI Actions -- Mouse Events
numberBtns.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.innerText);
        updateDisplay();
    });
});

operatorBtns.forEach(button => {
    button.addEventListener('click', () => {
        chooseOperation(button.innerText);
        updateDisplay();
    });
});

equalsBtn.addEventListener('click', () => {
    calculate();
    updateDisplay();
});

clearBtn.addEventListener('click', () => {
    clear();
    updateDisplay();
});

deleteBtn.addEventListener('click', () => {
    deleteNumber();
    updateDisplay();
});

percentBtn.addEventListener('click', () => {
    calculatePercent();
    updateDisplay();
});

// Bind Full Keyboard Support
document.addEventListener('keydown', (e) => {
    // Numbers & Decimal
    if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
        appendNumber(e.key);
        updateDisplay();
    }
    // Equations
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault(); 
        calculate();
        updateDisplay();
    }
    // Deletions
    if (e.key === 'Backspace') {
        deleteNumber();
        updateDisplay();
    }
    if (e.key === 'Escape') {
        clear();
        updateDisplay();
    }
    // Multi operators mapping
    if (e.key === '+' || e.key === '-') {
        chooseOperation(e.key);
        updateDisplay();
    }
    if (e.key === '*') {
        chooseOperation('×');
        updateDisplay();
    }
    if (e.key === '/') {
        e.preventDefault(); // Prevents quick find overlay bug in Firefox
        chooseOperation('÷');
        updateDisplay();
    }
    if (e.key === '%') {
        calculatePercent();
        updateDisplay();
    }
});

// Initialize State
clear();
updateDisplay();