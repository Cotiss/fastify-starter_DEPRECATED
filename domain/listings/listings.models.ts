import { Schema, model } from 'mongoose';

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, {
  timestamps: true,
});

export const Listing = model('Listing', listingSchema);
