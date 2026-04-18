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

// ✅ NEW
const {
  addToHistory,
  getHistory,
  saveContext,
  getContext
} = require('./memory');

function extractNumbers(message) {
  return message.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
}

async function orchestrate(message, userId = "default-user") {

  // ✅ STORE USER INPUT
  addToHistory(userId, "user", message);

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

    const fullCashFlows = [-initial, ...cashFlows];

    const npv = calculateNPV(fullCashFlows, rate);
    const irr = calculateIRR(fullCashFlows);
    const payback = calculatePaybackPeriod(fullCashFlows);

    // ✅ SAVE CONTEXT FOR FOLLOW-UP QUESTIONS
    saveContext(userId, "lastFinance", {
      initial,
      cashFlows,
      rate
    });

    const response = {
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

    addToHistory(userId, "assistant", JSON.stringify(response));
    return response;
  }

  // ---------------- FOLLOW-UP HANDLING ----------------
  // Example: "recalculate at 12%"
  if (message.toLowerCase().includes("recalculate")) {
    const context = getContext(userId).lastFinance;

    if (context) {
      const numbers = extractNumbers(message);
      const newRate = numbers[0] ? numbers[0] / 100 : context.rate;

      const fullCashFlows = [-context.initial, ...context.cashFlows];

      const npv = calculateNPV(fullCashFlows, newRate);
      const irr = calculateIRR(fullCashFlows);
      const payback = calculatePaybackPeriod(fullCashFlows);

      const response = {
        type: "finance_result",
        data: {
          initial: context.initial,
          cashFlows: context.cashFlows,
          rate: newRate,
          results: [
            { type: "npv", value: npv },
            { type: "irr", value: irr },
            { type: "payback", value: payback }
          ]
        }
      };

      addToHistory(userId, "assistant", JSON.stringify(response));
      return response;
    }
  }

  // ---------------- ACCOUNTING ----------------
  if (intent === "accounting") {
    const history = getHistory(userId);

    const response = await callAI(`Accounting analysis:\n${message}`, history);

    addToHistory(userId, "assistant", response);

    return {
      type: "accounting_result",
      data: response
    };
  }

  // ---------------- AUDIT ----------------
  if (intent === "audit") {
    const history = getHistory(userId);

    const response = await callAI(`Audit analysis:\n${message}`, history);

    addToHistory(userId, "assistant", response);

    return {
      type: "audit_result",
      data: response
    };
  }

  // ---------------- MACRO ----------------
  if (intent === "macroeconomics") {
    const numbers = extractNumbers(message);

    const result = analyzeMacroIndicators({
      inflation: numbers[0] || 0,
      gdpGrowth: numbers[1] || 0,
      interestRate: numbers[2] || 0
    });

    addToHistory(userId, "assistant", JSON.stringify(result));

    return {
      type: "macro_result",
      data: result
    };
  }

  // ---------------- MICRO ----------------
  if (intent === "microeconomics") {
    const numbers = extractNumbers(message);

    const result = analyzeMicroMarket({
      elasticity: numbers[0] || 1,
      marketShare: numbers[1] || 0.3
    });

    addToHistory(userId, "assistant", JSON.stringify(result));

    return {
      type: "micro_result",
      data: result
    };
  }

  // ---------------- ECONOMETRICS ----------------
  if (intent === "econometrics") {
    const history = getHistory(userId);

    const response = await callAI(`Econometrics analysis:\n${message}`, history);

    addToHistory(userId, "assistant", response);

    return {
      type: "econometrics_result",
      data: response
    };
  }

  // ---------------- GENERAL ----------------
  const history = getHistory(userId);
  const response = await callAI(message, history);

  addToHistory(userId, "assistant", response);

  return {
    type: "general",
    data: response
  };
}

module.exports = { orchestrate };