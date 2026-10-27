require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/workers', require('./routes/workers'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/advances', require('./routes/advances'));
app.use('/api/wages', require('./routes/wages'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
