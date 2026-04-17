function detectAuditRisks(data) {
  const risks = [];

  if (data.revenueGrowth > 0.5) {
    risks.push({ flag: "Revenue growth > 50%", risk: "HIGH", reason: "Unusually high growth may indicate revenue manipulation" });
  }

  if (data.receivablesGrowth > data.revenueGrowth) {
    risks.push({ flag: "Receivables growing faster than revenue", risk: "HIGH", reason: "Possible fictitious sales or collection problems" });
  }

  if (data.grossMarginChange < -0.1) {
    risks.push({ flag: "Gross margin declined > 10%", risk: "MEDIUM", reason: "Cost structure deterioration or pricing pressure" });
  }

  if (data.cashVsNetIncomeDiff > 0.3) {
    risks.push({ flag: "Large gap between cash flow and net income", risk: "HIGH", reason: "Possible earnings manipulation" });
  }

  if (data.inventoryGrowth > data.revenueGrowth) {
    risks.push({ flag: "Inventory growing faster than revenue", risk: "MEDIUM", reason: "Possible obsolete inventory or overproduction" });
  }

  if (data.relatedPartyTransactions) {
    risks.push({ flag: "Related party transactions detected", risk: "HIGH", reason: "Conflict of interest risk — requires disclosure review" });
  }

  return risks;
}

module.exports = { detectAuditRisks };