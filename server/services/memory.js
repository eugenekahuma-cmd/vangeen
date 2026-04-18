const Memory = require('../models/Memory');

/**
 * GET USER MEMORY (safe + bounded)
 */
async function getHistory(userId = 'anonymous', limit = 10) {
  try {
    const doc = await Memory.findOne({ userId });

    if (!doc || !doc.messages) return [];

    // return only last N messages
    return doc.messages.slice(-limit);

  } catch (err) {
    console.error("Memory Read Error:", err);
    return [];
  }
}

/**
 * SAVE MESSAGE (safe + idempotent)
 */
async function saveMessage(userId, role, content) {
  try {
    if (!content) return;

    let doc = await Memory.findOne({ userId });

    if (!doc) {
      doc = new Memory({
        userId,
        messages: []
      });
    }

    doc.messages.push({
      role,
      content
    });

    // 🔥 HARD LIMIT (prevents database bloat)
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

module.exports = {
  getHistory,
  saveMessage
};