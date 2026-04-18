function calculateNPV(initial, cashFlows, rate) {
  let npv = -initial;

  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + rate, t + 1);
  }

  return npv;
}

// 🔥 SAFE IRR (fixes explosion problem)
function calculateIRR(cashFlows) {
  let rate = 0.1;

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

    if (Math.abs(derivative) < 1e-10) return null;

    const newRate = rate - npv / derivative;

    if (!isFinite(newRate)) return rate;

    if (Math.abs(newRate - rate) < 1e-6) return newRate;

    rate = newRate;
  }

  return rate;
}

// 🔥 FIXED PAYBACK (correct logic)
function calculatePaybackPeriod(cashFlows, initial = 0) {
  let cumulative = -initial;

  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];

    if (cumulative >= 0) {
      return i + 1;
    }
  }

  return null;
}

function calculateDCF(cashFlows, rate) {
  return cashFlows.reduce((acc, cf, t) => {
    return acc + cf / Math.pow(1 + rate, t + 1);
  }, 0);
}

module.exports = {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod,
  calculateDCF
};