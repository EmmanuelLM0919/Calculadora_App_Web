document.addEventListener("DOMContentLoaded", function () {
    const expressionEl = document.getElementById("expression");
    const resultEl = document.getElementById("result");
    const keys = document.getElementById("keys");

    let expression = "";
    let result = "0";

    function updateScreen() {
        expressionEl.textContent = expression;
        resultEl.textContent = result;
    }

    function calculate() {
        try {
            let calc = expression.replace(/÷/g, "/").replace(/×/g, "*");
            let evalResult = Function('"use strict";return (' + calc + ')')();
            if (isNaN(evalResult) || !isFinite(evalResult)) {
                result = "Error";
                expression = "";
            } else {
                result = evalResult.toString();
                expression = result;
            }
        } catch {
            result = "Error";
            expression = "";
        }
        updateScreen();
    }

    keys.addEventListener("click", e => {
        const btn = e.target;
        const value = btn.dataset.value;
        const action = btn.dataset.action;

        if (value) {
            expression += value;
        } else if (action) {
            if (action === "clear") {
                expression = "";
                result = "0";
            } else if (action === "back") {
                expression = expression.slice(0, -1);
            } else if (action === "percent") {
                expression += "/100";
            } else if (action === "neg") {
                if (expression) expression = `(-1*(${expression}))`;
            } else if (action === "calculate") {
                calculate();
                return;
            }
        }
        updateScreen();
    });

    document.addEventListener("keydown", e => {
        if (!isNaN(e.key) || "+-*/.".includes(e.key)) {
            expression += e.key;
        } else if (e.key === "Enter") {
            calculate();
            return;
        } else if (e.key === "Backspace") {
            expression = expression.slice(0, -1);
        }
        updateScreen();
    });

    updateScreen();
});
