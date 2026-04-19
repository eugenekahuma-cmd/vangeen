const { classifyIntent } = require('./classifier');
const {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod
} = require('./financeEngine');

const { saveContext, getContext } = require('./memory');

function extractNumbers(message) {
  return message.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
}

async function orchestrate(message, userId) {

  const { intent } = await classifyIntent(message);

  // ---------------- FINANCE ----------------
  if (intent === "finance") {
    const numbers = extractNumbers(message);

    if (numbers.length < 3) {
      return { type: "error", data: "Provide: initial, cash flows, rate" };
    }

    const initial = numbers[0];
    const rate = numbers[numbers.length - 1] / 100;
    const cashFlows = numbers.slice(1, -1);

    const fullCashFlows = [-initial, ...cashFlows];

    const npv = calculateNPV(fullCashFlows, rate);
    const irr = calculateIRR(fullCashFlows);
    const payback = calculatePaybackPeriod(fullCashFlows);

    // ✅ SAVE CONTEXT ONLY
    saveContext(userId, "lastFinance", {
      initial,
      cashFlows,
      rate
    });

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

  // ---------------- FOLLOW-UP ----------------
  if (message.toLowerCase().includes("recalculate")) {
    const context = getContext(userId).lastFinance;

    if (!context) {
      return { type: "error", data: "No previous finance context found." };
    }

    const numbers = extractNumbers(message);
    const newRate = numbers[0] ? numbers[0] / 100 : context.rate;

    const fullCashFlows = [-context.initial, ...context.cashFlows];

    const npv = calculateNPV(fullCashFlows, newRate);
    const irr = calculateIRR(fullCashFlows);
    const payback = calculatePaybackPeriod(fullCashFlows);

    return {
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
  }

  // ---------------- DEFAULT ----------------
  return {
    type: "general",
    data: message
  };
}

module.exports = { orchestrate };