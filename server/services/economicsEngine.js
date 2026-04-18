function analyzeMacroIndicators(data) {
  return {
    inflationPressure: data.inflation > 0.05 ? "High" : "Moderate",
    growthOutlook: data.gdpGrowth > 0.03 ? "Expanding" : "Weak",
    policyStance: data.interestRate > data.inflation ? "Restrictive" : "Accommodative"
  };
}

function analyzeMicroMarket(data) {
  return {
    elasticity: data.elasticity > 1 ? "Elastic" : "Inelastic",
    marketPower: data.marketShare > 0.5 ? "High" : "Competitive"
  };
}

module.exports = {
  analyzeMacroIndicators,
  analyzeMicroMarket
};