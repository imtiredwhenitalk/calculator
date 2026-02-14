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
const graphMultiple = document.getElementById('graph-multiple');
const graphPlot = document.getElementById('graph-plot');
const graphStatus = document.getElementById('graph-status');
const graphCanvas = document.getElementById('graph-canvas');
const graphLegend = document.getElementById('graph-legend');

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
const sumInfo = document.getElementById('sum-info');

const integralExpr = document.getElementById('integral-expr');
const integralLower = document.getElementById('integral-lower');
const integralUpper = document.getElementById('integral-upper');
const integralSteps = document.getElementById('integral-steps');
const integralCalc = document.getElementById('integral-calc');
const integralResult = document.getElementById('integral-result');
const integralStatus = document.getElementById('integral-status');
const integralInfo = document.getElementById('integral-info');

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
const createMatrix = (container, size, readOnly = false, defaultValue = '') => {
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
const displayMatrix = (container, matrix, isResult = false) => {
    const size = matrix.length;
    container.innerHTML = '';
    const table = document.createElement('div');
    table.className = 'matrix-grid-table';
    if (isResult) {
        table.classList.add('matrix-result');
    }
    table.style.setProperty('--matrix-cols', size);
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = isResult ? 'matrix-cell matrix-cell-result' : 'matrix-cell';
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
    createMatrix(matrixAContainer, size, false, '');
    createMatrix(matrixBContainer, size, false, '');
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
        'tab.sum': 'Сума (Σ)',
        'tab.integral': 'Інтеграл (∫)',
        'graph.label': 'y = f(x)',
        'graph.range': 'Діапазон осі X',
        'graph.rangeHint': 'Введіть початок і кінець діапазону',
        'graph.multiple': 'Декілька функцій',
        'graph.multipleHint': 'Через крапку з комою (;)',
        'graph.title': 'Побудова графіка функції',
        'graph.step1': 'Крок 1: Введіть функцію через x.',
        'graph.step2': 'Крок 2: Задайте діапазон. Приклад: sin(x); cos(x)',
        'graph.plot': ' Побудувати',
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
        'deriv.calc': 'Обчислити похідну',
        'sum.label': 'f(n) - вираз',
        'sum.example': 'Приклад: 1/(n^2), 2*n+1, n^3',
        'sum.range': 'Діапазон: від першого до останнього значення',
        'sum.start': 'Початок (n):',
        'sum.end': 'Кінець (n):',
        'sum.calc': '∑ Обчислити суму',
        'integral.label': 'f(x) - функція',
        'integral.example': 'Приклад: x^2, sin(x), e^x, 1/x',
        'integral.lower': 'Нижня межа (a):',
        'integral.upper': 'Верхня межа (b):',
        'integral.range': 'Визначений інтеграл: від a до b',
        'integral.precision': 'Точність (розбиття):',
        'integral.precisionHint': 'Більше значення = точніше, але повільніше',
        'integral.calc': '∫ Обчислити інтеграл',
        'common.result': 'Результат',
        'status.graph.empty': 'Введіть функцію.',
        'status.graph.range': 'Некоректний діапазон.',
        'status.graph.invalid': 'Некоректна функція.',
        'status.matrix.invalid': 'Некоректні значення матриці.',
        'status.matrix.rows': 'Рядки повинні мати однакову довжину.',
        'status.matrix.error': 'Помилка матриці.',
        'status.deriv.empty': 'Введіть f(x).',
        'status.deriv.input': 'Некоректні x0 або h.',
        'status.deriv.error': 'Помилка похідної.',
        'status.sum.empty': 'Введіть вираз для n.',
        'status.sum.range': 'Некоректний діапазон.',
        'status.sum.error': 'Помилка суми.',
        'status.integral.empty': 'Введіть функцію.',
        'status.integral.range': 'Некоректні межі інтегрування.',
        'status.integral.input': 'Некоректні параметри.',
        'status.integral.error': 'Помилка інтеграла.',
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
        'tab.sum': 'Sum (Σ)',
        'tab.integral': 'Integral (∫)',
        'graph.label': 'y = f(x)',
        'graph.range': 'X-axis Range',
        'graph.rangeHint': 'Enter the start and end of the range',
        'graph.multiple': 'Multiple Functions',
        'graph.multipleHint': 'Separated by semicolon (;)',
        'graph.title': 'Function Graph Plotting',
        'graph.step1': 'Step 1: Enter a function in x.',
        'graph.step2': 'Step 2: Set range. Example: sin(x); cos(x)',
        'graph.plot': ' Plot',
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
        'deriv.calc': 'Compute derivative',
        'sum.label': 'f(n) - expression',
        'sum.example': 'Example: 1/(n^2), 2*n+1, n^3',
        'sum.range': 'Range: from first to last value',
        'sum.start': 'Start (n):',
        'sum.end': 'End (n):',
        'sum.calc': '∑ Compute Sum',
        'integral.label': 'f(x) - function',
        'integral.example': 'Example: x^2, sin(x), e^x, 1/x',
        'integral.lower': 'Lower bound (a):',
        'integral.upper': 'Upper bound (b):',
        'integral.range': 'Definite integral: from a to b',
        'integral.precision': 'Precision (divisions):',
        'integral.precisionHint': 'Higher value = more accurate but slower',
        'integral.calc': '∫ Compute Integral',
        'common.result': 'Result',
        'status.graph.empty': 'Enter a function.',
        'status.graph.range': 'Invalid range.',
        'status.graph.invalid': 'Invalid function.',
        'status.matrix.invalid': 'Invalid matrix values.',
        'status.matrix.rows': 'Rows must be same length.',
        'status.matrix.error': 'Matrix error.',
        'status.deriv.empty': 'Enter f(x).',
        'status.deriv.input': 'Invalid x0 or h.',
        'status.deriv.error': 'Derivative error.',
        'status.sum.empty': 'Enter expression in n.',
        'status.sum.range': 'Invalid range.',
        'status.sum.error': 'Sum error.',
        'status.integral.empty': 'Enter a function.',
        'status.integral.range': 'Invalid integration bounds.',
        'status.integral.input': 'Invalid parameters.',
        'status.integral.error': 'Integral error.',
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

const preprocessExpression = (expr) => {
    // Minimal preprocessing - let math.js handle most of it
    let cleaned = expr.replace(/\s+/g, '');
    // Only handle basic cases that math.js doesn't
    cleaned = cleaned.replace(/\)\(/g, ')*(');
    cleaned = cleaned.replace(/(\d)pi\b/g, '$1*pi');
    cleaned = cleaned.replace(/pi\b(\d)/g, 'pi*$1');
    cleaned = cleaned.replace(/(\d)e\b/g, '$1*e');
    cleaned = cleaned.replace(/\be(\d)/g, 'e*$1');
    cleaned = cleaned.replace(/(\d)\(/g, '$1*(');
    cleaned = cleaned.replace(/\)(\d)/g, ')*$1');
    return cleaned;
};

const formatNumber = (value) => {
    if (!Number.isFinite(value)) {
        return 'Error';
    }
    const absValue = Math.abs(value);
    if (absValue !== 0 && (absValue >= 1e6 || absValue < 1e-6)) {
        return value.toExponential(2);
    }
    return Number(value.toFixed(2)).toString();
};

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const plotGraph = () => {
    // Gather all expressions from both inputs
    let expressions = [];
    
    const mainInput = graphInput?.value?.trim() || '';
    const multiInput = graphMultiple?.value?.trim() || '';
    
    // If multiple input has functions, use it; otherwise use main input
    const primaryInput = multiInput || mainInput;
    
    if (primaryInput) {
        expressions = primaryInput
            .split(/[;,]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
    
    const minValue = parseFloat(graphMin?.value) || -10;
    const maxValue = parseFloat(graphMax?.value) || 10;
    graphStatus.textContent = '';

    if (!expressions.length) {
        graphStatus.textContent = t('status.graph.empty');
        return;
    }
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue >= maxValue) {
        graphStatus.textContent = t('status.graph.range');
        return;
    }

    const steps = 1024;
    const threshold = 100;
    const palette = ['#f59f0b', '#38bdf8', '#a855f7', '#f43f5e', '#22c55e', '#ec4899', '#10b981', '#06b6d4'];

    let compiledExpressions = [];
    let failedExpressions = [];
    
    try {
        compiledExpressions = expressions.map((expr, idx) => {
            try {
                const normalized = normalizeExpression(expr);
                const preprocessed = preprocessExpression(normalized);
                console.log(`Expr: "${expr}" -> "${preprocessed}"`);
                // Test compilation
                const testCompile = mathInstance.compile(preprocessed);
                return {
                    raw: expr,
                    normalized: preprocessed,
                    compiled: testCompile,
                    error: null
                };
            } catch (e) {
                failedExpressions.push(`"${expr}": ${e.message}`);
                console.error(`Failed to compile "${expr}": ${e.message}`);
                return null;
            }
        }).filter(x => x !== null);
    } catch (error) {
        graphStatus.textContent = `Помилка компіляції: ${error.message}`;
        console.error('Graph compilation error:', error);
        return;
    }
    
    if (!compiledExpressions.length) {
        graphStatus.textContent = `Не вдалось скомпілювати функції. ${failedExpressions.join('; ')}`;
        return;
    }

    const datasets = compiledExpressions.map((compiledItem, index) => {
        const dataPoints = [];
        let lastValidY = null;
        
        for (let i = 0; i < steps; i += 1) {
            const x = minValue + (maxValue - minValue) * (i / (steps - 1));
            try {
                const y = compiledItem.compiled.evaluate({ 
                    x, 
                    pi: mathInstance.pi, 
                    e: mathInstance.e,
                    PI: mathInstance.pi,
                    E: mathInstance.e 
                });
                const numericY = toNumber(y);
                
                // Handle discontinuities (like tan at pi/2)
                if (numericY !== null && Number.isFinite(numericY) && Math.abs(numericY) < threshold) {
                    dataPoints.push({ x, y: numericY });
                    lastValidY = numericY;
                } else if (Math.abs(numericY) >= threshold) {
                    // Skip outliers for discontinuous functions
                    dataPoints.push({ x, y: null });
                } else {
                    dataPoints.push({ x, y: null });
                }
            } catch (e) {
                dataPoints.push({ x, y: null });
            }
        }

        const color = palette[index % palette.length];
        return {
            label: compiledItem.raw || 'f(x)',
            data: dataPoints,
            borderColor: color,
            backgroundColor: color + '08',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.0,
            fill: false,
            spanGaps: false,
            segment: {
                borderColor: ctx => {
                    if (ctx.p0?.skip || ctx.p1?.skip) {
                        return 'transparent';
                    }
                    return color;
                },
            },
        };
    });

    // Update legend with better styling
    if (graphLegend) {
        graphLegend.innerHTML = '';
        compiledExpressions.forEach((item, index) => {
            const color = palette[index % palette.length];
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.gap = '10px';
            legendItem.style.marginBottom = '8px';
            legendItem.style.padding = '8px';
            legendItem.style.borderRadius = '6px';
            legendItem.style.backgroundColor = 'rgba(99, 102, 241, 0.06)';
            legendItem.style.transition = 'all 0.2s ease';
            legendItem.style.cursor = 'pointer';
            
            const colorDot = document.createElement('div');
            colorDot.style.width = '14px';
            colorDot.style.height = '14px';
            colorDot.style.borderRadius = '3px';
            colorDot.style.backgroundColor = color;
            colorDot.style.flexShrink = '0';
            colorDot.style.boxShadow = `0 0 8px ${color}40`;
            
            const label = document.createElement('span');
            label.textContent = item.raw;
            label.style.fontSize = '12px';
            label.style.color = '#cbd5e1';
            label.style.wordBreak = 'break-word';
            label.style.fontFamily = 'Space Grotesk, sans-serif';
            
            legendItem.appendChild(colorDot);
            legendItem.appendChild(label);
            
            // Hover effect
            legendItem.addEventListener('mouseenter', () => {
                legendItem.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
            });
            legendItem.addEventListener('mouseleave', () => {
                legendItem.style.backgroundColor = 'rgba(99, 102, 241, 0.06)';
            });
            
            graphLegend.appendChild(legendItem);
        });
    }

    if (!chart) {
        chart = new Chart(graphCanvas, {
            type: 'line',
            data: {
                datasets,
            },
            options: {
                animation: {
                    duration: 500,
                    easing: 'easeOutQuart',
                },
                parsing: false,
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: minValue,
                        max: maxValue,
                        grid: {
                            color: (context) => {
                                if (Math.abs(context.tick.value) < 0.01) {
                                    return 'rgba(255, 255, 255, 0.4)';
                                }
                                return 'rgba(100, 150, 200, 0.08)';
                            },
                            lineWidth: (context) => {
                                if (Math.abs(context.tick.value) < 0.01) {
                                    return 2;
                                }
                                return 0.5;
                            },
                            drawBorder: false,
                            drawTicks: true,
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 10,
                                weight: '500',
                            },
                            stepSize: undefined,
                            padding: 8,
                            callback: function(value) {
                                if (value === 0) return '0';
                                return value > 0 ? '+' + value.toFixed(0) : value.toFixed(0);
                            }
                        },
                        border: {
                            display: false,
                        },
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            color: (context) => {
                                if (Math.abs(context.tick.value) < 0.01) {
                                    return 'rgba(255, 255, 255, 0.4)';
                                }
                                return 'rgba(100, 150, 200, 0.08)';
                            },
                            lineWidth: (context) => {
                                if (Math.abs(context.tick.value) < 0.01) {
                                    return 2;
                                }
                                return 0.5;
                            },
                            drawBorder: false,
                            drawTicks: true,
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 10,
                                weight: '500',
                            },
                            stepSize: undefined,
                            padding: 8,
                            callback: function(value) {
                                if (value === 0) return '0';
                                return value.toFixed(1);
                            }
                        },
                        border: {
                            display: false,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(10, 13, 24, 0.96)',
                        titleColor: '#f8fafc',
                        titleFont: {
                            size: 12,
                            weight: 'bold',
                            family: 'Space Grotesk, sans-serif'
                        },
                        bodyColor: '#e2e8f0',
                        bodyFont: {
                            size: 11,
                            family: 'Space Grotesk, sans-serif'
                        },
                        borderColor: '#5b6bff',
                        borderWidth: 2,
                        padding: 12,
                        displayColors: true,
                        boxPadding: 8,
                        usePointStyle: true,
                        callbacks: {
                            title: function(context) {
                                if (context.length > 0) {
                                    return `x = ${context[0].parsed.x.toFixed(2)}`;
                                }
                                return '';
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                            },
                            afterLabel: function(context) {
                                // Add empty line between datasets
                                return '';
                            }
                        }
                    },
                },
            },
        });
    } else {
        chart.data.datasets = datasets;
        chart.options.scales.x.min = minValue;
        chart.options.scales.x.max = maxValue;
        chart.update();
    }
    
    graphStatus.textContent = '';
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
            displayMatrix(matrixResultContainer, formatMatrix(result), true);
        } else if (type === 'mul') {
            result = mathInstance.multiply(a, b);
            displayMatrix(matrixResultContainer, formatMatrix(result), true);
        } else if (type === 'det') {
            const detValue = mathInstance.det(a);
            const detDisplay = document.createElement('div');
            detDisplay.className = 'result-box matrix-det-result';
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
    const derivInfo = document.getElementById('deriv-info');
    if (derivInfo) derivInfo.textContent = '';
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
        const expression = preprocessExpression(normalizeExpression(expr));
        const compiled = mathInstance.compile(expression);
        const f1 = compiled.evaluate({ x: x0 + h, pi: mathInstance.pi, e: mathInstance.e });
        const f2 = compiled.evaluate({ x: x0 - h, pi: mathInstance.pi, e: mathInstance.e });
        const derivative = (f1 - f2) / (2 * h);
        const numericValue = toNumber(derivative);
        if (numericValue === null) {
            throw new Error('derivative.invalid');
        }
        derivResult.textContent = formatNumber(numericValue);
        if (derivInfo) derivInfo.textContent = `f'(${x0}) = ${formatNumber(numericValue)}`;
    } catch {
        derivStatus.textContent = t('status.deriv.error');
    }
};

derivCalc.addEventListener('click', computeDerivative);

const computeSum = () => {
    sumStatus.textContent = '';
    sumInfo.textContent = '';
    const expr = sumExpr.value.trim();
    const start = Number(sumStart.value);
    const end = Number(sumEnd.value);
    if (!expr) {
        sumStatus.textContent = t('status.sum.empty');
        return;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        sumStatus.textContent = t('status.sum.range');
        return;
    }
    try {
        const startInt = Math.ceil(start);
        const endInt = Math.floor(end);
        if (startInt > endInt) {
            sumStatus.textContent = t('status.sum.range');
            return;
        }
        const expression = preprocessExpression(normalizeExpression(expr));
        const compiled = mathInstance.compile(expression);
        let total = 0;
        for (let n = startInt; n <= endInt; n += 1) {
            total += compiled.evaluate({ n, pi: mathInstance.pi, e: mathInstance.e });
        }
        sumResult.textContent = formatNumber(total);
        sumInfo.textContent = `∑(n=${startInt},${endInt}) ${expr}`;
    } catch {
        sumStatus.textContent = t('status.sum.error');
    }
};

sumCalc.addEventListener('click', computeSum);

const computeIntegral = () => {
    integralStatus.textContent = '';
    integralInfo.textContent = '';
    const expr = integralExpr.value.trim();
    const lower = Number(integralLower.value);
    const upper = Number(integralUpper.value);
    const steps = Number(integralSteps.value) || 1000;
    
    if (!expr) {
        integralStatus.textContent = t('status.integral.empty');
        return;
    }
    if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
        integralStatus.textContent = t('status.integral.range');
        return;
    }
    if (lower >= upper) {
        integralStatus.textContent = t('status.integral.range');
        return;
    }
    if (!Number.isFinite(steps) || steps < 10 || steps > 10000) {
        integralStatus.textContent = t('status.integral.input');
        return;
    }
    
    try {
        const expression = preprocessExpression(normalizeExpression(expr));
        const compiled = mathInstance.compile(expression);
        
        // Simpson's rule for numerical integration
        const n = Math.floor(steps / 2) * 2; // Make it even
        const h = (upper - lower) / n;
        let sum = compiled.evaluate({ x: lower, pi: mathInstance.pi, e: mathInstance.e });
        sum += compiled.evaluate({ x: upper, pi: mathInstance.pi, e: mathInstance.e });
        
        for (let i = 1; i < n; i += 2) {
            const x = lower + i * h;
            sum += 4 * compiled.evaluate({ x, pi: mathInstance.pi, e: mathInstance.e });
        }
        for (let i = 2; i < n; i += 2) {
            const x = lower + i * h;
            sum += 2 * compiled.evaluate({ x, pi: mathInstance.pi, e: mathInstance.e });
        }
        
        const result = (sum * h) / 3;
        const numericValue = toNumber(result);
        
        if (numericValue === null || !Number.isFinite(numericValue)) {
            throw new Error('integral.invalid');
        }
        
        integralResult.textContent = formatNumber(numericValue);
        integralInfo.textContent = `∫[${lower.toFixed(2)}, ${upper.toFixed(2)}] ${expr} dx`;
    } catch (error) {
        integralStatus.textContent = t('status.integral.error');
        console.error('Integral error:', error);
    }
};

integralCalc.addEventListener('click', computeIntegral);

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
