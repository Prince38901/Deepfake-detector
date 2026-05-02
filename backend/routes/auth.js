// backend/routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateMFASecret, verifyMFA } = require('../middleware/auth');
const logger = require('../utils/logger');

// Mock user database
const users = [];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate MFA secret
    const mfaSecret = generateMFASecret();

    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      roles: ['user'],
      mfaSecret: mfaSecret.base32
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles },
      mfaSecret: mfaSecret.secret
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if MFA is required
    if (user.mfaRequired) {
      return res.json({
        mfaRequired: true,
        message: 'Please verify your MFA code',
        token: jwt.sign(
          { id: user.id, email: user.email, mfaVerified: false },
          process.env.JWT_SECRET || 'default_secret_key',
          { expiresIn: '5m' }
        )
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles },
      mfaRequired: false
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route   POST /api/auth/verify-mfa
 * @desc    Verify MFA code
 * @access  Public
 */
router.post('/verify-mfa', (req, res) => {
  try {
    const { mfaCode } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!mfaCode || !token) {
      return res.status(400).json({ error: 'MFA code and token are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const isMFAValid = verifyMFA(mfaCode, user.mfaSecret);
    if (!isMFAValid) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Generate new token with MFA verified
    const newToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles, mfaVerified: true },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: newToken,
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles }
    });
  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

module.exports = router;
