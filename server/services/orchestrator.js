const { classifyIntent } = require('./classifier');
const {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod
} = require('./financeEngine');

const {
  saveContext,
  getContext
} = require('./memory');

function extractNumbers(message) {
  return message.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
}

async function orchestrate(message, userId = "guest") {
  try {
    const lower = message.toLowerCase();

    // ================= FOLLOW-UP FIRST =================
    if (lower.includes("recalculate")) {
      const context = getContext(userId).lastFinance;

      if (!context) {
        return {
          type: "error",
          data: "No previous finance context found."
        };
      }

      const numbers = extractNumbers(message);
      const newRate = numbers[0] ? numbers[0] / 100 : context.rate;

      const fullCashFlows = [-context.initial, ...context.cashFlows];

      return {
        type: "finance_result",
        data: {
          initial: context.initial,
          cashFlows: context.cashFlows,
          rate: newRate,
          results: [
            { type: "npv", value: calculateNPV(fullCashFlows, newRate) },
            { type: "irr", value: calculateIRR(fullCashFlows) },
            { type: "payback", value: calculatePaybackPeriod(fullCashFlows) }
          ]
        }
      };
    }

    // ================= CLASSIFICATION =================
    const { intent } = await classifyIntent(message);

    // ================= FINANCE =================
    if (intent === "finance") {
      const numbers = extractNumbers(message);

      // 🚨 CRITICAL FIX: Only compute if enough numbers
      if (numbers.length >= 3) {
        const initial = numbers[0];
        const rate = numbers[numbers.length - 1] / 100;
        const cashFlows = numbers.slice(1, -1);

        const fullCashFlows = [-initial, ...cashFlows];

        const result = {
          type: "finance_result",
          data: {
            initial,
            cashFlows,
            rate,
            results: [
              { type: "npv", value: calculateNPV(fullCashFlows, rate) },
              { type: "irr", value: calculateIRR(fullCashFlows) },
              { type: "payback", value: calculatePaybackPeriod(fullCashFlows) }
            ]
          }
        };

        // ✅ SAVE CONTEXT
        saveContext(userId, "lastFinance", {
          initial,
          cashFlows,
          rate
        });

        return result;
      }

      // 🚨 KEY FIX: FALLBACK TO EXPLANATION (NOT ERROR)
      return {
        type: "general",
        data: message
      };
    }

    // ================= DEFAULT =================
    return {
      type: "general",
      data: message
    };

  } catch (err) {
    console.error("Orchestrator Error:", err);

    return {
      type: "error",
      data: "Orchestrator failure",
      details: err.message
    };
  }
}

module.exports = { orchestrate };