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

function isRecalculation(message) {
  const m = message.toLowerCase();
  return (
    m.includes("recalculate") ||
    m.includes("change rate") ||
    m.includes("new rate") ||
    m.includes("%")
  );
}

async function orchestrate(message, userId = "guest") {
  try {
    const { intent } = await classifyIntent(message);

    // ================= FOLLOW-UP (RUN FIRST) =================
    if (isRecalculation(message)) {
      const history = await getHistory(userId);

      const lastFinance = [...history]
        .reverse()
        .find(m => {
          if (m.role !== "assistant") return false;

          try {
            const parsed = JSON.parse(m.content);
            return parsed?.type === "finance_result";
          } catch {
            return false;
          }
        });

      if (!lastFinance) {
        return {
          type: "error",
          data: "No previous finance context found."
        };
      }

      let context;
      try {
        context = JSON.parse(lastFinance.content).data;
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

    // ================= GENERAL =================
    const history = await getHistory(userId);

    const response = {
      type: "general",
      data: message
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