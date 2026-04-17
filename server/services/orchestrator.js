const { detectIntent } = require('./intent');
const { calculateNPV, calculateIRR, calculatePaybackPeriod } = require('./financeEngine');
const { calculateRatios, analyzeStatement } = require('./accountingEngine');
const { detectAuditRisks } = require('./auditEngine');
const { interpretRegression } = require('./econometricsEngine');
const { callAI } = require('./aiService');

async function orchestrate(message, history) {
  const intent = detectIntent(message);

  if (intent === "calculation") return await handleCalculation(message, history);
  if (intent === "accounting") return await handleAccounting(message, history);
  if (intent === "audit") return await handleAudit(message, history);
  if (intent === "econometrics") return await handleEconometrics(message, history);
  if (intent === "macroeconomics") return await handleMacro(message, history);
  if (intent === "microeconomics") return await handleMicro(message, history);
  if (intent === "analysis") return await handleAnalysis(message, history);
  return await handleExplanation(message, history);
}

async function handleCalculation(message, history) {
  try {
    const numbers = message.match(/[\d,]+\.?\d*/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];

    if (numbers.length < 3) {
      return { reply: "Please provide: initial investment, cash flows, and discount rate.\n\nExample: Calculate NPV with initial investment 500000, cash flows 120000 150000 180000, rate 10%" };
    }

    const initial = numbers[0];
    const rate = numbers[numbers.length - 1] / 100;
    const cashFlows = numbers.slice(1, -1);

    const npv = calculateNPV(initial, cashFlows, rate);
    const allFlows = [-initial, ...cashFlows];
    const irr = calculateIRR(allFlows);
    const payback = calculatePaybackPeriod(initial, cashFlows);

    const explanation = await callAI(`
Explain these investment results professionally and concisely:

Initial Investment: ${initial}
Cash Flows: ${cashFlows.join(', ')}
Discount Rate: ${rate * 100}%
NPV: ${npv.toFixed(2)}
IRR: ${(irr * 100).toFixed(2)}%
Payback Period: ${payback} years
Decision: ${npv > 0 ? "ACCEPT" : "REJECT"}
    `, history);

    return {
      reply: `📊 INVESTMENT ANALYSIS RESULTS

━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Investment: ${initial.toLocaleString()}
Cash Flows: ${cashFlows.map(c => c.toLocaleString()).join(', ')}
Discount Rate: ${(rate * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━
NPV:     ${npv.toFixed(2)}
IRR:     ${(irr * 100).toFixed(2)}%
Payback: ${payback ? payback + ' years' : 'Not recovered within period'}
Decision: ${npv > 0 ? '✅ ACCEPT' : '❌ REJECT'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
    };

  } catch (err) {
    console.error(err);
    return { reply: "Error processing calculation. Please check your input format." };
  }
}

async function handleAccounting(message, history) {
  try {
    const numbers = message.match(/[\d,]+\.?\d*/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];

    if (numbers.length < 4) {
      return { reply: "Please provide financial data.\n\nExample: Calculate ratios — Revenue 1000000, Net Income 150000, Total Assets 800000, Equity 400000, Current Assets 300000, Current Liabilities 150000" };
    }

    const data = {
      revenue: numbers[0],
      netIncome: numbers[1],
      totalAssets: numbers[2],
      equity: numbers[3],
      currentAssets: numbers[4] || null,
      currentLiabilities: numbers[5] || null,
      totalDebt: numbers[6] || null,
      grossProfit: numbers[7] || null
    };

    const ratios = calculateRatios(data);
    const flags = analyzeStatement(ratios);

    const explanation = await callAI(`
Interpret these financial ratios professionally:

${JSON.stringify(ratios, null, 2)}

Risk Flags: ${flags.length > 0 ? flags.join(', ') : 'None detected'}

Give structured analysis covering liquidity, profitability, and efficiency.
    `, history);

    return {
      reply: `📋 ACCOUNTING RATIO ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPUTED RATIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(ratios).map(([k, v]) => `${k}: ${v}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK FLAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━
${flags.length > 0 ? flags.join('\n') : '✅ No major risk flags detected'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
    };

  } catch (err) {
    console.error(err);
    return { reply: "Error processing accounting data." };
  }
}

async function handleAudit(message, history) {
  const explanation = await callAI(`
You are an expert auditor. Analyze the following audit query and provide:
1. Key audit risks identified
2. Red flags to investigate
3. Recommended audit procedures
4. Internal control recommendations

Query: ${message}
  `, history);

  return {
    reply: `📋 AUDIT ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
  };
}

async function handleEconometrics(message, history) {
  const explanation = await callAI(`
You are an expert econometrician. Analyze the following and provide:
1. Statistical interpretation
2. Economic significance
3. Model implications
4. Limitations and assumptions

Query: ${message}
  `, history);

  return {
    reply: `📈 ECONOMETRICS ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
  };
}

async function handleMacro(message, history) {
  const explanation = await callAI(`
You are a macroeconomics expert. Provide a structured analysis covering:
1. Key macroeconomic concepts involved
2. Theoretical framework
3. Real-world implications
4. Policy considerations

Query: ${message}
  `, history);

  return {
    reply: `🌍 MACROECONOMICS ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
  };
}

async function handleMicro(message, history) {
  const explanation = await callAI(`
You are a microeconomics expert. Provide structured analysis covering:
1. Market structure and behavior
2. Supply and demand dynamics
3. Price and quantity implications
4. Economic efficiency analysis

Query: ${message}
  `, history);

  return {
    reply: `📉 MICROECONOMICS ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━
${explanation}`
  };
}

async function handleAnalysis(message, history) {
  const response = await callAI(message, history);
  return { reply: response };
}

async function handleExplanation(message, history) {
  const response = await callAI(message, history);
  return { reply: response };
}

module.exports = { orchestrate };