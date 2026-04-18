const { classifyIntent } = require('./classifier');
const {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod
} = require('./financeEngine');
const {
  analyzeMacroIndicators,
  analyzeMicroMarket
} = require('./economicsEngine');
const { callAI } = require('./aiService');

function extractNumbers(message) {
  return message.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
}

async function orchestrate(message) {
  const { intent } = await classifyIntent(message);

  // ---------------- FINANCE ----------------
  if (intent === "finance") {
    const numbers = extractNumbers(message);

    if (numbers.length < 3) {
      return {
        type: "error",
        data: "Provide: initial, cash flows, rate"
      };
    }

    const initial = numbers[0];
    const rate = numbers[numbers.length - 1] / 100;
    const cashFlows = numbers.slice(1, -1);

    // 🔥 CRITICAL FIX — include initial investment
    const fullCashFlows = [-initial, ...cashFlows];

    const npv = calculateNPV(fullCashFlows, rate);
    const irr = calculateIRR(fullCashFlows);
    const payback = calculatePaybackPeriod(fullCashFlows);

    return {
      type: "finance_result",
      data: {
        initial,
        cashFlows,
        rate,
        results: [
          { type: "npv", value: npv },
          { type: "irr", value: irr },
          { type: "payback", value: payback }
        ]
      }
    };
  }

  // ---------------- ACCOUNTING ----------------
  if (intent === "accounting") {
    return {
      type: "accounting_result",
      data: await callAI(`Accounting analysis:\n${message}`)
    };
  }

  // ---------------- AUDIT ----------------
  if (intent === "audit") {
    return {
      type: "audit_result",
      data: await callAI(`Audit analysis:\n${message}`)
    };
  }

  // ---------------- MACRO ----------------
  if (intent === "macroeconomics") {
    const numbers = extractNumbers(message);

    return {
      type: "macro_result",
      data: analyzeMacroIndicators({
        inflation: numbers[0] || 0,
        gdpGrowth: numbers[1] || 0,
        interestRate: numbers[2] || 0
      })
    };
  }

  // ---------------- MICRO ----------------
  if (intent === "microeconomics") {
    const numbers = extractNumbers(message);

    return {
      type: "micro_result",
      data: analyzeMicroMarket({
        elasticity: numbers[0] || 1,
        marketShare: numbers[1] || 0.3
      })
    };
  }

  // ---------------- ECONOMETRICS ----------------
  if (intent === "econometrics") {
    return {
      type: "econometrics_result",
      data: await callAI(`Econometrics analysis:\n${message}`)
    };
  }

  // ---------------- GENERAL ----------------
  return {
    type: "general",
    data: await callAI(message)
  };
}

module.exports = { orchestrate };