function calculateNPV(initial, cashFlows, rate) {
  let npv = -initial;
  cashFlows.forEach((cf, i) => {
    npv += cf / Math.pow(1 + rate, i + 1);
  });
  return npv;
}

function calculateIRR(cashFlows, guess = 0.1) {
  let rate = guess;
  for (let i = 0; i < 1000; i++) {
    let npv = 0;
    let derivative = 0;
    cashFlows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + rate, t);
      derivative -= t * cf / Math.pow(1 + rate, t + 1);
    });
    let newRate = rate - npv / derivative;
    if (Math.abs(newRate - rate) < 1e-6) return newRate;
    rate = newRate;
  }
  return rate;
}

function calculatePaybackPeriod(initial, cashFlows) {
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= initial) {
      return i + 1;
    }
  }
  return null;
}

function calculateDCF(cashFlows, rate) {
  return cashFlows.reduce((dcf, cf, i) => {
    return dcf + cf / Math.pow(1 + rate, i + 1);
  }, 0);
}

module.exports = { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateDCF };