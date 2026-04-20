const { classifyIntent } = require('./classifier');

const {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod
} = require('./financeEngine');

const {
  getHistory,
  saveMessage
} = require('./memory');

function extractNumbers(message) {
  return message.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
}

async function orchestrate(message, userId = "guest") {
  try {
    const { intent } = await classifyIntent(message);

    // ================= FINANCE =================
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

      await saveMessage(userId, "assistant", JSON.stringify(response));
      return response;
    }

    // ================= FOLLOW-UP =================
    if (message.toLowerCase().includes("recalculate")) {
      const history = await getHistory(userId);
      const lastFinance = [...history]
        .reverse()
        .find(m => m.role === "assistant");

      if (!lastFinance) {
        return {
          type: "error",
          data: "No previous finance context found."
        };
      }

      let context;
      try {
        context = JSON.parse(lastFinance.content)?.data;
      } catch {
        return {
          type: "error",
          data: "Corrupted finance context."
        };
      }

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

      await saveMessage(userId, "assistant", JSON.stringify(response));
      return response;
    }

    // ================= DEFAULT =================
    const history = await getHistory(userId);

    const response = {
      type: "general",
      data: message,
      historyUsed: history.length
    };

    await saveMessage(userId, "assistant", message);

    return response;

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