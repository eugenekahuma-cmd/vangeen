function calculateRatios(data) {
  const {
    revenue,
    netIncome,
    totalAssets,
    equity,
    currentAssets,
    currentLiabilities,
    totalDebt,
    grossProfit,
    operatingIncome,
    inventory,
    accountsReceivable
  } = data;

  const ratios = {};

  if (revenue && netIncome) ratios.profitMargin = (netIncome / revenue).toFixed(4);
  if (netIncome && totalAssets) ratios.ROA = (netIncome / totalAssets).toFixed(4);
  if (netIncome && equity) ratios.ROE = (netIncome / equity).toFixed(4);
  if (currentAssets && currentLiabilities) ratios.currentRatio = (currentAssets / currentLiabilities).toFixed(4);
  if (totalDebt && equity) ratios.debtToEquity = (totalDebt / equity).toFixed(4);
  if (grossProfit && revenue) ratios.grossMargin = (grossProfit / revenue).toFixed(4);
  if (operatingIncome && revenue) ratios.operatingMargin = (operatingIncome / revenue).toFixed(4);
  if (currentAssets && inventory && currentLiabilities) {
    ratios.quickRatio = ((currentAssets - inventory) / currentLiabilities).toFixed(4);
  }
  if (revenue && accountsReceivable) {
    ratios.receivablesTurnover = (revenue / accountsReceivable).toFixed(4);
  }

  return ratios;
}

function analyzeStatement(ratios) {
  const flags = [];

  if (ratios.currentRatio < 1) flags.push("⚠️ Current ratio below 1 — liquidity risk");
  if (ratios.debtToEquity > 2) flags.push("⚠️ High debt-to-equity — leverage risk");
  if (ratios.profitMargin < 0.05) flags.push("⚠️ Low profit margin — profitability concern");
  if (ratios.ROA < 0.05) flags.push("⚠️ Low ROA — asset efficiency concern");
  if (ratios.quickRatio < 1) flags.push("⚠️ Quick ratio below 1 — short-term liquidity risk");

  return flags;
}

module.exports = { calculateRatios, analyzeStatement };