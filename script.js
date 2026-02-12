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

const matrixA = document.getElementById('matrix-a');
const matrixB = document.getElementById('matrix-b');
const matrixResult = document.getElementById('matrix-result');
const matrixStatus = document.getElementById('matrix-status');
const matrixButtons = document.querySelectorAll('[data-matrix]');

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

let chart = null;

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
        'matrix.size': 'Такий самий розмір, як A',
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
        'matrix.size': 'Same size as A',
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
    const steps = 240;
    for (let i = 0; i < steps; i += 1) {
        const x = minValue + (maxValue - minValue) * (i / (steps - 1));
        try {
            const y = mathInstance.evaluate(expression, { x });
            if (Number.isFinite(y)) {
                dataPoints.push({ x, y });
            } else {
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
                    },
                ],
            },
            options: {
                animation: {
                    duration: 650,
                    easing: 'easeOutQuart',
                },
                parsing: false,
                scales: {
                    x: {
                        type: 'linear',
                        grid: {
                            color: 'rgba(255,255,255,0.06)',
                        },
                        ticks: {
                            color: '#cbd5f5',
                        },
                    },
                    y: {
                        grid: {
                            color: 'rgba(255,255,255,0.06)',
                        },
                        ticks: {
                            color: '#cbd5f5',
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5f5',
                        },
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
    return matrix
        .toArray()
        .map((row) => row.map((value) => Number(value).toFixed(4)).join(' '))
        .join('\n');
};

const runMatrixOperation = (type) => {
    matrixStatus.textContent = '';
    matrixResult.value = '';
    try {
        const a = mathInstance.matrix(parseMatrix(matrixA.value));
        const b = mathInstance.matrix(parseMatrix(matrixB.value));
        let result;
        if (type === 'add') {
            result = mathInstance.add(a, b);
            matrixResult.value = formatMatrix(result);
        } else if (type === 'mul') {
            result = mathInstance.multiply(a, b);
            matrixResult.value = formatMatrix(result);
        } else if (type === 'det') {
            matrixResult.value = String(mathInstance.det(a));
        }
    } catch (error) {
        if (error.message === 'matrix.invalid') {
            matrixStatus.textContent = t('status.matrix.invalid');
        } else if (error.message === 'matrix.rows') {
            matrixStatus.textContent = t('status.matrix.rows');
        } else {
            matrixStatus.textContent = t('status.matrix.error');
        }
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
