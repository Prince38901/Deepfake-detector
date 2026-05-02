// backend/routes/field.js - Field Operations Routes
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @route   POST /api/field/offline-sync
 * @desc    Sync offline detections
 * @access  Private
 */
router.post('/offline-sync', (req, res) => {
  try {
    const { detections } = req.body;
    logger.info(`Syncing ${detections?.length || 0} offline detections`);
    
    res.json({ success: true, synced: detections?.length || 0 });
  } catch (error) {
    logger.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
