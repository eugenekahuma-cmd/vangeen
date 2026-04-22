const providerStats = {};

function initProvider(name) {
  if (!providerStats[name]) {
    providerStats[name] = {
      success: 0,
      fail: 0,
      totalLatency: 0,
      calls: 0,
      circuitOpen: false,
      lastFailureTime: null
    };
  }
}

function recordSuccess(name, latency) {
  initProvider(name);
  const p = providerStats[name];

  p.success++;
  p.calls++;
  p.totalLatency += latency;
  p.circuitOpen = false;
}

function recordFailure(name) {
  initProvider(name);
  const p = providerStats[name];

  p.fail++;
  p.calls++;
  p.lastFailureTime = Date.now();

  // 🔥 CIRCUIT BREAKER RULE
  if (p.fail >= 3) {
    p.circuitOpen = true;
  }
}

function isAvailable(name) {
  initProvider(name);
  const p = providerStats[name];

  if (!p.circuitOpen) return true;

  // 🔥 RESET AFTER 30s
  const cooldown = 30000;
  if (Date.now() - p.lastFailureTime > cooldown) {
    p.circuitOpen = false;
    p.fail = 0;
    return true;
  }

  return false;
}

function getScore(name) {
  initProvider(name);
  const p = providerStats[name];

  const successRate = p.calls ? p.success / p.calls : 1;
  const avgLatency = p.calls ? p.totalLatency / p.calls : 1000;

  // 🔥 LOWER SCORE = BETTER
  return avgLatency * (1 / successRate);
}

module.exports = {
  recordSuccess,
  recordFailure,
  isAvailable,
  getScore
};