function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

async function retry(fn, retries = 2) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;

      const backoff = 300 * Math.pow(2, attempt); // 300ms → 600ms → 1200ms
      await delay(backoff);
      attempt++;
    }
  }
}

module.exports = {
  retry,
  withTimeout
};