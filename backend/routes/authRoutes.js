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

// Register new food donor
router.post('/register-donor', (req, res) => {
  const { name, type, email, phone, locationId, address, contactPerson, fssaiLicense, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Donor or business name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Check duplicate email
  const existing = repo.getAllDonors().find(d => d.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A donor with this email already exists.' });
  }

  const newDonor = repo.addDonor({
    name: name.trim(),
    type: type || 'Restaurant',
    email: email.trim().toLowerCase(),
    phone: phone || '+91 98450 99999',
    locationId: locationId || 'LOC_01',
    address: address || 'City Sector Commercial Hub',
    contactPerson: contactPerson || name.trim(),
    fssaiLicense: fssaiLicense || `FSSAI-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    description: description || 'Registered commercial surplus food donor.'
  });

  res.status(201).json({
    token: `mock-token-${newDonor.id}`,
    user: {
      ...newDonor,
      role: 'DONOR'
    },
    message: 'Food donor registered successfully!'
  });
});

// Register new recipient shelter
router.post('/register-recipient', (req, res) => {
  const { name, category, email, phone, locationId, address, capacity, coordinator } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Shelter or organization name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Check duplicate email
  const existing = repo.getAllRecipients().find(r => r.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A recipient shelter with this email already exists.' });
  }

  const newRecipient = repo.addRecipient({
    name: name.trim(),
    category: category || 'Community Shelter',
    email: email.trim().toLowerCase(),
    phone: phone || '+91 97400 99999',
    locationId: locationId || 'LOC_04',
    address: address || 'Community Center Lane',
    capacity: parseInt(capacity, 10) || 50,
    coordinator: coordinator || name.trim(),
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80'
  });

  res.status(201).json({
    token: `mock-token-${newRecipient.id}`,
    user: {
      ...newRecipient,
      role: 'RECIPIENT'
    },
    message: 'Recipient shelter registered successfully!'
  });
});

module.exports = router;

