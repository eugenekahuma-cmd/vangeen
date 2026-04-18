function calculateNPV(cashFlows, rate) {
  return cashFlows.reduce((npv, cf, t) => {
    return npv + cf / Math.pow(1 + rate, t);
  }, 0);
}

function calculateIRR(cashFlows, guess = 0.1) {
  let rate = guess;

  for (let i = 0; i < 1000; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);

      npv += cashFlows[t] / denom;
      derivative -= (t * cashFlows[t]) / (denom * (1 + rate));
    }

    if (Math.abs(derivative) < 1e-10) return null;

    const newRate = rate - npv / derivative;

    if (!isFinite(newRate)) return null;

    if (Math.abs(newRate - rate) < 1e-7) return newRate;

    rate = newRate;
  }

  return null;
}

function calculatePaybackPeriod(cashFlows) {
  let cumulative = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) return i;
  }

  return null;
}

function calculateDCF(cashFlows, rate) {
  return calculateNPV(cashFlows, rate);
}

module.exports = {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod,
  calculateDCF
};