// Variables de estado
const exprEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
let expression = ''; // expresión en texto
let lastResult = null;
// Actualiza pantalla
function updateScreen() {
    exprEl.textContent = expression;
    resultEl.textContent = expression === '' ? '0' : expression;
}
// Añade un valor (número o punto u operador)
function appendValue(val) {
    // Evitar dos puntos seguidos en el mismo número:
    if (val === '.') {
        // extraer el último número tras el último operador
        const lastNum = expression.split(/[\+\-\*\/%]/).pop();
        if (lastNum.includes('.')) return;
        if (lastNum === '') expression += '0'; // ".5" => "0.5"
    }
    // Evitar operadores al inicio (salvo '-')
    if (/[\+\*\/%]/.test(val) && expression === '') return;
    // Evitar operadores dobles (reemplazar)
    if (/[\+\-\*\/%]/.test(val) && /[\+\-\*\/%]$/.test(expression)) {
        // permite cambiar operador final (ej: 5 + -> 5 -)
        expression = expression.slice(0, -1) + val;
    } else {
        expression += val;
    }
    updateScreen();
}
// Borra todo
function clearAll() {
    expression = '';
    lastResult = null;
    updateScreen();
}
// Backspace
function backspace() {
    if (expression.length === 0) return;
    expression = expression.slice(0, -1);
    updateScreen();
}
// Negar número actual (±)
function negate() {
    // encuentra el último número
    const parts = expression.split(/([\+\-\*\/%])/);
    if (parts.length === 0) return;
    const last = parts.pop();
    if (last === '') return;
    const before = parts.join('');
    if (last.startsWith('-')) {
        expression = before + last.slice(1);
    } else {
        expression = before + '(' + (-1 * parseFloat(last)) + ')';
    }
    updateScreen();
}
// Porcentaje: transforma último número en /100
function percent() {
    const parts = expression.split(/([\+\-\*\/%])/);
    const last = parts.pop();
    if (!last) return;
    const before = parts.join('');
    const num = parseFloat(last);
    if (Number.isNaN(num)) return;
    expression = before + (num / 100);
    updateScreen();
}
// Calcula la expresión de forma segura
function calculate() {
    if (expression.trim() === '') return;
    try {
        // Seguridad: permitir solo caracteres válidos
        if (!/^[0-9+\-*/%().\s]+$/.test(expression)) {
            throw new Error('Expresión inválida');
        }
        // Reemplazar % si quedan (aunque manejamos antes)
        const safeExpr = expression.replace(/%/g, '/100');
        // Evaluación: usando Function para evitar algunos riesgos de eval directo
        // Nota: esto sigue siendo para uso en cliente/local. No ejecutar código arbitrario del usuario en servidor.
        const fn = new Function('return (' + safeExpr + ')');
        const res = fn();
        lastResult = res;
        expression = String(res);
        updateScreen();
    } catch (e) {
        resultEl.textContent = 'Error';
        console.error('Error cálculo:', e);
    }
}
// Manejo de clicks en botones
document.getElementById('keys').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');
    if (val !== null) appendValue(val);
    else if (action === 'clear') clearAll();
    else if (action === 'back') backspace();
    else if (action === 'neg') negate();
    else if (action === 'percent') percent();
    else if (action === 'calculate') calculate();
});
// Soporte de teclado
window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) {
        appendValue(e.key);
        e.preventDefault();
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
        e.preventDefault();
    } else if (e.key === 'Backspace') {
        backspace();
        e.preventDefault();
    } else if (e.key.toLowerCase() === 'c') {
        clearAll();
        e.preventDefault();
    }
});
// Inicializar
updateScreen();