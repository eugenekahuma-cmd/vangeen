const Memory = require('../models/Memory');

/**
 * GET USER MEMORY (safe + bounded)
 */
async function getHistory(userId = 'anonymous', limit = 10) {
  try {
    const doc = await Memory.findOne({ userId });

    if (!doc || !doc.messages) return [];

    return doc.messages.slice(-limit);

  } catch (err) {
    console.error("Memory Read Error:", err);
    return [];
  }
}

/**
 * SAVE MESSAGE (canonical write function)
 */
async function saveMessage(userId = 'anonymous', role, content) {
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
      timestamp: new Date() // 🔥 add structure early
    });

    // 🔥 HARD LIMIT (prevents DB bloat)
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

/**
 * ⚠️ TEMPORARY BACKWARD COMPATIBILITY
 * Prevents crashes from legacy calls
 */
async function addToHistory(userId, role, content) {
  return saveMessage(userId, role, content);
}

module.exports = {
  getHistory,
  saveMessage,
  addToHistory // remove later after full refactor
};