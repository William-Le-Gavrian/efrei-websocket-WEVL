import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true, lowercase: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now }
});

export default mongoose.model('Player', playerSchema);