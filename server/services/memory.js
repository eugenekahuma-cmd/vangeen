// Simple in-memory store (can upgrade to Redis later)

const memoryStore = new Map();

/*
Structure:
{
  userId: {
    history: [],
    context: {}
  }
}
*/

function getUserMemory(userId) {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, {
      history: [],
      context: {}
    });
  }
  return memoryStore.get(userId);
}

function addToHistory(userId, role, content) {
  const userMemory = getUserMemory(userId);

  userMemory.history.push({ role, content });

  // keep last 10 messages only (prevent token bloat)
  if (userMemory.history.length > 10) {
    userMemory.history.shift();
  }
}

function getHistory(userId) {
  return getUserMemory(userId).history;
}

function saveContext(userId, key, value) {
  const userMemory = getUserMemory(userId);
  userMemory.context[key] = value;
}

function getContext(userId) {
  return getUserMemory(userId).context;
}

module.exports = {
  addToHistory,
  getHistory,
  saveContext,
  getContext
};