function calculateNPV(cashFlows, rate) {
  return cashFlows.reduce((acc, cf, t) => {
    return acc + cf / Math.pow(1 + rate, t);
  }, 0);
}

// Stable IRR (Newton-Raphson with safety guards)
function calculateIRR(cashFlows, guess = 0.1) {
  let rate = guess;

  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);

      npv += cashFlows[t] / denom;

      if (rate !== -1) {
        derivative += (-t * cashFlows[t]) / (denom * (1 + rate));
      }
    }

    if (Math.abs(derivative) < 1e-10) break;

    const newRate = rate - npv / derivative;

    if (!isFinite(newRate)) break;

    if (Math.abs(newRate - rate) < 1e-7) return newRate;

    rate = newRate;
  }

  return rate;
}

function calculatePaybackPeriod(cashFlows) {
  let cumulative = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];

    if (cumulative >= 0) return i + 1;
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