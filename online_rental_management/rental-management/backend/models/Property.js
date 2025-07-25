const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional link to user
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
