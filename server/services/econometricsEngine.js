function interpretRegression(variables) {
  return variables.map(v => {
    let significance = "";
    if (v.p < 0.01) significance = "Highly significant (1% level)";
    else if (v.p < 0.05) significance = "Significant (5% level)";
    else if (v.p < 0.10) significance = "Weakly significant (10% level)";
    else significance = "Not statistically significant";

    return {
      variable: v.name,
      coefficient: v.coef,
      pValue: v.p,
      tStat: v.t || null,
      significance,
      direction: v.coef > 0 ? "positive" : "negative",
      interpretation: `A unit increase in ${v.name} leads to a ${Math.abs(v.coef)} ${v.coef > 0 ? "increase" : "decrease"} in the dependent variable.`
    };
  });
}

function interpretModelFit(rSquared, adjRSquared, fStat, fPValue) {
  return {
    rSquared,
    adjRSquared,
    fStat,
    fPValue,
    modelSignificance: fPValue < 0.05 ? "Model is statistically significant" : "Model is NOT significant",
    fitQuality: rSquared > 0.8 ? "Strong fit" : rSquared > 0.5 ? "Moderate fit" : "Weak fit"
  };
}

module.exports = { interpretRegression, interpretModelFit };