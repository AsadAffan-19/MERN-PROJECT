const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

// GET /api/profile — returns the single profile, creating an empty one the first time
router.get('/', async (req, res) => {
  let profile = await Profile.findOne();
  if (!profile) profile = await Profile.create({});
  res.json(profile);
});

// PUT /api/profile — update the single profile (created if it doesn't exist yet)
router.put('/', async (req, res) => {
  try {
    const { _id, __v, ...fields } = req.body;
    const profile = await Profile.findOneAndUpdate({}, fields, {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
    });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
