const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/rentalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error: ", err));

// Register
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ msg: "User already exists" });

  const user = new User({ name, email, password });
  await user.save();

  const token = jwt.sign({ id: user._id }, 'your_jwt_secret_key', { expiresIn: '30d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

// Login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, 'your_jwt_secret_key', { expiresIn: '30d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

// Protected Booking Route
app.post('/api/bookings', async (req, res) => {
  try {
    const { token, propertyId, startDate, endDate } = req.body;
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    const userId = decoded.id;

    const booking = new Booking({
      user: userId,
      property: propertyId,
      startDate,
      endDate,
      status: 'pending'
    });

    await booking.save();
    res.json({ msg: "Booking created", booking });
  } catch (err) {
    res.status(401).json({ msg: "Invalid or missing token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
