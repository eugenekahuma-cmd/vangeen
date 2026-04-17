function detectIntent(message) {
  const m = message.toLowerCase();

  if (m.includes("npv") || m.includes("irr") || m.includes("calculate")) {
    return "calculation";
  }

  if (m.includes("ratio") || m.includes("financial statement")) {
    return "accounting";
  }

  if (m.includes("analyze") || m.includes("evaluate")) {
    return "analysis";
  }

  if (m.includes("regression") || m.includes("stata") || m.includes("econometrics") || m.includes("coefficient")) {
    return "econometrics";
  }

  if (m.includes("macro") || m.includes("gdp") || m.includes("inflation") || m.includes("monetary policy")) {
    return "macroeconomics";
  }

  if (m.includes("micro") || m.includes("supply") || m.includes("demand") || m.includes("elasticity")) {
    return "microeconomics";
  }

  if (m.includes("audit") || m.includes("red flag") || m.includes("internal control")) {
    return "audit";
  }

  return "explanation";
}

module.exports = { detectIntent };