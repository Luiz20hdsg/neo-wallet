const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  cpf: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String }, // Hash bcrypt (opcional se usar MFA)
  mfa: {
    facialRecognition: { type: Boolean, default: true },
    biometrics: { type: Boolean, default: false },
    pin: { type: String }, // Hash bcrypt
    geolocation: { 
      enabled: { type: Boolean, default: false },
      coordinates: { type: [Number] } // [longitude, latitude]
    }
  },
  documents: {
    identityFront: { type: String }, // URL da imagem
    identityBack: { type: String },
    selfieWithDoc: { type: String }
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash do PIN antes de salvar
userSchema.pre('save', async function (next) {
  if (this.mfa.pin && this.isModified('mfa.pin')) {
    this.mfa.pin = await bcrypt.hash(this.mfa.pin, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);