const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateFace } = require('../utils/face-recognition');

exports.generateJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

exports.validateMFA = async (userId, method, data) => {
  const user = await User.findById(userId);
  
  switch (method) {
    case 'facial':
      return await validateFace(data.selfie, user.documents.selfieWithDoc);
    case 'pin':
      return bcrypt.compare(data.pin, user.mfa.pin);
    case 'geolocation':
      return checkGeolocation(user.mfa.geolocation, data.coordinates);
    default:
      throw new Error('Método MFA inválido');
  }
};