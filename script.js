const display = document.getElementById('display');
const calcButtons = document.querySelectorAll('#calc-grid .btn');

const viewButtons = document.querySelectorAll('.view-btn');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const langSelect = document.getElementById('lang-select');

const graphInput = document.getElementById('graph-input');
const graphMin = document.getElementById('graph-min');
const graphMax = document.getElementById('graph-max');
const graphPlot = document.getElementById('graph-plot');
const graphStatus = document.getElementById('graph-status');
const graphCanvas = document.getElementById('graph-canvas');

const matrixAContainer = document.getElementById('matrix-a-container');
const matrixBContainer = document.getElementById('matrix-b-container');
const matrixResultContainer = document.getElementById('matrix-result-container');
const matrixStatus = document.getElementById('matrix-status');
const matrixButtons = document.querySelectorAll('[data-matrix]');
const sizeButtons = document.querySelectorAll('.size-btn');

const derivFx = document.getElementById('deriv-fx');
const derivX = document.getElementById('deriv-x');
const derivH = document.getElementById('deriv-h');
const derivCalc = document.getElementById('deriv-calc');
const derivResult = document.getElementById('deriv-result');
const derivStatus = document.getElementById('deriv-status');

const sumExpr = document.getElementById('sum-expr');
const sumStart = document.getElementById('sum-start');
const sumEnd = document.getElementById('sum-end');
const sumCalc = document.getElementById('sum-calc');
const sumResult = document.getElementById('sum-result');
const sumStatus = document.getElementById('sum-status');

const mathInstance = window.math;

// Додаємо функцію котангенса до Math.js
mathInstance.import({
    cot: function(x) {
        return 1 / Math.tan(x);
    }
}, { override: true });

let chart = null;
let currentMatrixSize = 2;

// Функція створення візуальної матриці
const createMatrix = (container, size, readOnly = false, defaultValue = '0') => {
    container.innerHTML = '';
    const table = document.createElement('div');
    table.className = 'matrix-grid-table';
    table.style.setProperty('--matrix-cols', size);
    
    for (let i = 0; i < size * size; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'matrix-cell';
        input.value = defaultValue;
        input.readOnly = readOnly;
        input.dataset.row = Math.floor(i / size);
        input.dataset.col = i % size;
        table.appendChild(input);
    }
    
    container.appendChild(table);
};

// Зчитування значень з візуальної матриці
const getMatrixValues = (container) => {
    const inputs = container.querySelectorAll('.matrix-cell');
    const size = Math.sqrt(inputs.length);
    const matrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const index = i * size + j;
            const value = parseFloat(inputs[index].value) || 0;
            row.push(value);
        }
        matrix.push(row);
    }
    
    return matrix;
};

// Відображення матриці результату
const displayMatrix = (container, matrix) => {
    const size = matrix.length;
    container.innerHTML = '';
    const table = document.createElement('div');
    table.className = 'matrix-grid-table';
    table.style.setProperty('--matrix-cols', size);
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'matrix-cell';
            input.value = matrix[i][j].toFixed(2);
            input.readOnly = true;
            table.appendChild(input);
        }
    }
    
    container.appendChild(table);
};

// Ініціалізація матриць
const initializeMatrices = (size) => {
    currentMatrixSize = size;
    createMatrix(matrixAContainer, size, false, '0');
    createMatrix(matrixBContainer, size, false, '0');
    matrixResultContainer.innerHTML = '';
    matrixStatus.textContent = '';
};

const translations = {
    uk: {
        title: 'Калькулятор',
        'view.calculator': 'Калькулятор',
        'view.mathlab': 'Матем. лабораторія',
        'app.subtitle': 'Науковий калькулятор зроблений imtiredwhenitalk',
        'app.title': 'Калькулятор',
        'app.chip': 'Інженерний',
        'mathlab.subtitle': 'Матем. лабораторія',
        'mathlab.title': 'Графіки, Матриці, Похідні',
        'mathlab.helper': 'Оберіть вкладку та виконайте короткі кроки нижче.',
        'tab.graph': 'Графік',
        'tab.matrix': 'Матриці',
        'tab.derivative': 'Похідна',
        'tab.sum': 'Сума',
        'graph.label': 'Функція f(x)',
        'graph.step1': 'Крок 1: Введіть функцію через x.',
        'graph.step2': 'Крок 2: Задайте діапазон. Приклад: sin(x) + x^2',
        'graph.plot': 'Побудувати',
        'matrix.labelA': 'Матриця A',
        'matrix.labelB': 'Матриця B',
        'matrix.format': 'Формат: 1,2;3,4',
        'matrix.size': 'Розмір матриці',
        'matrix.operation': 'Операція',
        'matrix.result': 'Результат',
        'deriv.label': 'f(x)',
        'deriv.example': 'Приклад: x^2 + 2*x',
        'deriv.x0': 'x0',
        'deriv.h': 'h',
        'deriv.step': 'Крок h для центральної різниці',
        'sum.label': 'Сума виразу за n',
        'sum.example': 'Приклад: 1/(n^2)',
        'sum.range': 'Діапазон: від .. до',
        'common.result': 'Результат',
        'status.graph.empty': 'Введіть функцію.',
        'status.graph.range': 'Некоректний діапазон.',
        'status.matrix.invalid': 'Некоректні значення матриці.',
        'status.matrix.rows': 'Рядки повинні мати однакову довжину.',
        'status.matrix.error': 'Помилка матриці.',
        'status.deriv.empty': 'Введіть f(x).',
        'status.deriv.input': 'Некоректні x0 або h.',
        'status.deriv.error': 'Помилка похідної.',
        'status.sum.empty': 'Введіть вираз для n.',
        'status.sum.range': 'Некоректний діапазон.',
        'status.sum.error': 'Помилка суми.',
    },
    en: {
        title: 'Calculator',
        'view.calculator': 'Calculator',
        'view.mathlab': 'Math Lab',
        'app.subtitle': 'Scientific calculator made by imtiredwhenitalk',
        'app.title': 'Calculator',
        'app.chip': 'Engineering',
        'mathlab.subtitle': 'Math Lab',
        'mathlab.title': 'Graphs, Matrices, Derivatives',
        'mathlab.helper': 'Choose a tab and follow the short steps below.',
        'tab.graph': 'Graph',
        'tab.matrix': 'Matrix',
        'tab.derivative': 'Derivative',
        'tab.sum': 'Sum',
        'graph.label': 'Function f(x)',
        'graph.step1': 'Step 1: Enter a function in x.',
        'graph.step2': 'Step 2: Set range. Example: sin(x) + x^2',
        'graph.plot': 'Plot',
        'matrix.labelA': 'Matrix A',
        'matrix.labelB': 'Matrix B',
        'matrix.format': 'Format: 1,2;3,4',
        'matrix.size': 'Matrix Size',
        'matrix.operation': 'Operation',
        'matrix.result': 'Result',
        'deriv.label': 'f(x)',
        'deriv.example': 'Example: x^2 + 2*x',
        'deriv.x0': 'x0',
        'deriv.h': 'h',
        'deriv.step': 'Central difference step h',
        'sum.label': 'Sum expression in n',
        'sum.example': 'Example: 1/(n^2)',
        'sum.range': 'Range: start .. end',
        'common.result': 'Result',
        'status.graph.empty': 'Enter a function.',
        'status.graph.range': 'Invalid range.',
        'status.matrix.invalid': 'Invalid matrix values.',
        'status.matrix.rows': 'Rows must be same length.',
        'status.matrix.error': 'Matrix error.',
        'status.deriv.empty': 'Enter f(x).',
        'status.deriv.input': 'Invalid x0 or h.',
        'status.deriv.error': 'Derivative error.',
        'status.sum.empty': 'Enter expression in n.',
        'status.sum.range': 'Invalid range.',
        'status.sum.error': 'Sum error.',
    },
};

const t = (key) => {
    const lang = langSelect?.value || 'uk';
    return translations[lang]?.[key] ?? key;
};

const applyLocale = (lang) => {
    document.documentElement.lang = lang;
    document.title = translations[lang]?.title || 'Calculator';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        const text = translations[lang]?.[key];
        if (text) {
            element.textContent = text;
        }
    });
};

const appendValue = (value) => {
    display.value += value;
};

const clearDisplay = () => {
    display.value = '';
};

const backspace = () => {
    display.value = display.value.slice(0, -1);
};

const evaluateExpression = () => {
    const expression = display.value.trim();
    if (!expression) {
        return;
    }
    try {
        const result = mathInstance.evaluate(expression, {
            pi: mathInstance.pi,
            e: mathInstance.e,
        });
        display.value = Number.isFinite(result) ? String(result) : 'Error';
    } catch {
        display.value = 'Error';
    }
};

calcButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === 'clear') {
            clearDisplay();
            return;
        }
        if (action === 'back') {
            backspace();
            return;
        }
        if (action === 'equals') {
            evaluateExpression();
            return;
        }
        if (value) {
            appendValue(value);
        }
    });
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[0-9+\-*/().^]$/.test(key)) {
        appendValue(key);
        return;
    }
    if (key === 'Enter') {
        evaluateExpression();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});

const switchTab = (tab) => {
    tabButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.tab === tab);
    });
    tabPanels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === `panel-${tab}`);
    });
};

const switchView = (view) => {
    viewButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.view === view);
    });
    viewPanels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.viewPanel === view);
    });
    if (view === 'mathlab' && chart) {
        chart.resize();
    }
};

viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
        switchView(button.dataset.view);
    });
});

tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
        switchTab(button.dataset.tab);
    });
});

const normalizeExpression = (expr) => expr.replace(/\^/g, '^');

const plotGraph = () => {
    const expr = graphInput.value.trim();
    const minValue = Number(graphMin.value);
    const maxValue = Number(graphMax.value);
    graphStatus.textContent = '';

    if (!expr) {
        graphStatus.textContent = t('status.graph.empty');
        return;
    }
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue >= maxValue) {
        graphStatus.textContent = t('status.graph.range');
        return;
    }

    const expression = normalizeExpression(expr);
    const dataPoints = [];
    const steps = 480; // Збільшена кількість точок для кращої деталізації
    const threshold = 1e6; // Поріг для фільтрації екстремальних значень біля асимптот
    
    for (let i = 0; i < steps; i += 1) {
        const x = minValue + (maxValue - minValue) * (i / (steps - 1));
        try {
            const y = mathInstance.evaluate(expression, { x });
            // Фільтруємо нескінченні та екстремально великі значення
            if (Number.isFinite(y) && Math.abs(y) < threshold) {
                dataPoints.push({ x, y });
            } else {
                // Додаємо null для розриву графіка на асимптотах
                dataPoints.push({ x, y: null });
            }
        } catch {
            dataPoints.push({ x, y: null });
        }
    }

    if (!chart) {
        chart = new Chart(graphCanvas, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'f(x)',
                        data: dataPoints,
                        borderColor: '#f59f0b',
                        borderWidth: 2,
                        pointRadius: 0,
                        spanGaps: false, // Не з'єднувати точки через розриви (асимптоти)
                        segment: {
                            borderColor: ctx => {
                                // Пропускаємо лінії між null значеннями
                                return ctx.p0.skip || ctx.p1.skip ? 'transparent' : '#f59f0b';
                            }
                        }
                    },
                ],
            },
            options: {
                animation: {
                    duration: 650,
                    easing: 'easeOutQuart',
                },
                parsing: false,
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 0) {
                                    return 'rgba(255, 255, 255, 0.5)'; // Вісь X яскравіша
                                }
                                return 'rgba(100, 150, 200, 0.15)'; // Сітка видніша
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            },
                            drawBorder: true,
                            drawTicks: true,
                        },
                        ticks: {
                            color: '#cbd5f5',
                            font: {
                                size: 11,
                            },
                            stepSize: undefined, // Автоматичний крок
                        },
                        border: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.3)',
                            width: 2,
                        },
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 0) {
                                    return 'rgba(255, 255, 255, 0.5)'; // Вісь Y яскравіша
                                }
                                return 'rgba(100, 150, 200, 0.15)'; // Сітка видніша
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            },
                            drawBorder: true,
                            drawTicks: true,
                        },
                        ticks: {
                            color: '#cbd5f5',
                            font: {
                                size: 11,
                            },
                            stepSize: undefined, // Автоматичний крок
                        },
                        border: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.3)',
                            width: 2,
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5f5',
                            font: {
                                size: 13,
                            },
                        },
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `x: ${context.parsed.x.toFixed(3)}, y: ${context.parsed.y.toFixed(3)}`;
                            }
                        }
                    },
                },
            },
        });
    } else {
        chart.data.datasets[0].data = dataPoints;
        chart.update();
    }
};

graphPlot.addEventListener('click', plotGraph);

const parseMatrix = (text) => {
    const rows = text
        .trim()
        .split(';')
        .map((row) => row.split(',').map((value) => Number(value.trim())));
    if (!rows.length || rows.some((row) => row.some((value) => Number.isNaN(value)))) {
        throw new Error('matrix.invalid');
    }
    const size = rows[0].length;
    if (rows.some((row) => row.length !== size)) {
        throw new Error('matrix.rows');
    }
    return rows;
};

const formatMatrix = (matrix) => {
    return matrix.toArray();
};

const runMatrixOperation = (type) => {
    matrixStatus.textContent = '';
    matrixResultContainer.innerHTML = '';
    
    try {
        const aValues = getMatrixValues(matrixAContainer);
        const bValues = getMatrixValues(matrixBContainer);
        
        const a = mathInstance.matrix(aValues);
        const b = mathInstance.matrix(bValues);
        
        let result;
        if (type === 'add') {
            result = mathInstance.add(a, b);
            displayMatrix(matrixResultContainer, formatMatrix(result));
        } else if (type === 'mul') {
            result = mathInstance.multiply(a, b);
            displayMatrix(matrixResultContainer, formatMatrix(result));
        } else if (type === 'det') {
            const detValue = mathInstance.det(a);
            const detDisplay = document.createElement('div');
            detDisplay.className = 'result-box';
            detDisplay.textContent = `det(A) = ${detValue.toFixed(4)}`;
            matrixResultContainer.appendChild(detDisplay);
        }
    } catch (error) {
        matrixStatus.textContent = t('status.matrix.error');
        console.error('Matrix operation error:', error);
    }
};

matrixButtons.forEach((button) => {
    button.addEventListener('click', () => {
        runMatrixOperation(button.dataset.matrix);
    });
});

const computeDerivative = () => {
    derivStatus.textContent = '';
    const expr = derivFx.value.trim();
    const x0 = Number(derivX.value);
    const h = Number(derivH.value);
    if (!expr) {
        derivStatus.textContent = t('status.deriv.empty');
        return;
    }
    if (!Number.isFinite(x0) || !Number.isFinite(h) || h <= 0) {
        derivStatus.textContent = t('status.deriv.input');
        return;
    }
    try {
        const f1 = mathInstance.evaluate(expr, { x: x0 + h });
        const f2 = mathInstance.evaluate(expr, { x: x0 - h });
        const derivative = (f1 - f2) / (2 * h);
        derivResult.textContent = String(derivative);
    } catch {
        derivStatus.textContent = t('status.deriv.error');
    }
};

derivCalc.addEventListener('click', computeDerivative);

const computeSum = () => {
    sumStatus.textContent = '';
    const expr = sumExpr.value.trim();
    const start = Number(sumStart.value);
    const end = Number(sumEnd.value);
    if (!expr) {
        sumStatus.textContent = t('status.sum.empty');
        return;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
        sumStatus.textContent = t('status.sum.range');
        return;
    }
    try {
        let total = 0;
        for (let n = Math.floor(start); n <= Math.floor(end); n += 1) {
            total += mathInstance.evaluate(expr, { n });
        }
        sumResult.textContent = String(total);
    } catch {
        sumStatus.textContent = t('status.sum.error');
    }
};

sumCalc.addEventListener('click', computeSum);

plotGraph();

// Ініціалізація матриць
initializeMatrices(2);

// Обробники для вибору розміру матриці
sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const size = parseInt(button.dataset.size);
        sizeButtons.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        initializeMatrices(size);
    });
});

if (langSelect) {
    const stored = localStorage.getItem('calc-lang');
    const initial = stored || langSelect.value || 'uk';
    langSelect.value = initial;
    applyLocale(initial);
    langSelect.addEventListener('change', () => {
        localStorage.setItem('calc-lang', langSelect.value);
        applyLocale(langSelect.value);
    });
}
