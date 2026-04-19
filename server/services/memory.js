const Memory = require('../models/Memory');

// ---------------- IN-MEMORY CONTEXT ----------------
const contextStore = {};

// ---------------- GET HISTORY ----------------
async function getHistory(userId = 'guest', limit = 10) {
  try {
    const doc = await Memory.findOne({ userId });

    if (!doc || !doc.messages) return [];

    return doc.messages.slice(-limit);

  } catch (err) {
    console.error("Memory Read Error:", err);
    return [];
  }
}

// ---------------- SAVE MESSAGE ----------------
async function saveMessage(userId = 'guest', role, content) {
  try {
    if (!content) return false;

    let doc = await Memory.findOne({ userId });

    if (!doc) {
      doc = new Memory({
        userId,
        messages: []
      });
    }

    doc.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    if (doc.messages.length > 50) {
      doc.messages = doc.messages.slice(-50);
    }

    await doc.save();
    return true;

  } catch (err) {
    console.error("Memory Write Error:", err);
    return false;
  }
}

// ---------------- CONTEXT ----------------
function saveContext(userId, key, value) {
  if (!contextStore[userId]) {
    contextStore[userId] = {};
  }

  contextStore[userId][key] = value;
}

function getContext(userId) {
  return contextStore[userId] || {};
}

module.exports = {
  getHistory,
  saveMessage,
  saveContext,
  getContext
};