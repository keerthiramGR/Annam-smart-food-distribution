/**
 * Annam - Smart Food Distribution System
 * Authentication & Persona Switcher Routes
 */

const express = require('express');
const router = express.Router();
const repo = require('../data/repository');

// Get all demo accounts grouped by role
router.get('/accounts', (req, res) => {
  const donors = repo.getAllDonors().map(d => ({
    id: d.id,
    name: d.name,
    role: 'DONOR',
    type: d.type,
    email: d.email,
    locationId: d.locationId,
    avatar: d.avatar
  }));

  const recipients = repo.getAllRecipients().map(r => ({
    id: r.id,
    name: r.name,
    role: 'RECIPIENT',
    category: r.category,
    email: r.email,
    locationId: r.locationId,
    avatar: r.avatar
  }));

  const admin = {
    id: repo.getAdmin().id,
    name: repo.getAdmin().name,
    role: 'SUPER_ADMIN',
    email: repo.getAdmin().email,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  };

  res.json({
    donors,
    recipients,
    admin
  });
});

// Login simulation
router.post('/login', (req, res) => {
  const { role, id, email } = req.body;

  if (role === 'SUPER_ADMIN' || email === 'admin@annam.org') {
    const admin = repo.getAdmin();
    return res.json({
      token: 'mock-token-admin',
      user: {
        id: admin.id,
        name: admin.name,
        role: 'SUPER_ADMIN',
        email: admin.email,
        title: admin.title
      }
    });
  }

  if (role === 'DONOR') {
    const donor = id ? repo.getDonorById(id) : repo.getAllDonors()[0];
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    return res.json({
      token: `mock-token-${donor.id}`,
      user: {
        ...donor,
        role: 'DONOR'
      }
    });
  }

  if (role === 'RECIPIENT') {
    const recipient = id ? repo.getRecipientById(id) : repo.getAllRecipients()[0];
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
    return res.json({
      token: `mock-token-${recipient.id}`,
      user: {
        ...recipient,
        role: 'RECIPIENT'
      }
    });
  }

  res.status(400).json({ error: 'Invalid login role requested' });
});

module.exports = router;
