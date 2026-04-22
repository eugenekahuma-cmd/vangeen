function safeFallback(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("npv")) {
    return "Provide: initial investment, cash flows, and discount rate.";
  }

  if (msg.includes("irr")) {
    return "IRR is the rate that makes NPV = 0. Provide cash flows to calculate.";
  }

  return "AI is temporarily unavailable. Please retry.";
}

module.exports = { safeFallback };