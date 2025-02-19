const { validateFace } = require('../utils/face-recognition');
const User = require('../models/User');

exports.continuousFaceAuth = async (req, res, next) => {
  const userId = req.user.id; // Extraído do JWT
  const user = await User.findById(userId);

  if (user.mfa.facialRecognition) {
    const currentFace = req.body.currentFace; // Imagem da câmera do app
    const isMatch = await validateFace(currentFace, user.documents.selfieWithDoc);

    if (!isMatch) {
      // Encerra a sessão e bloqueia o app
      await User.updateOne({ _id: userId }, { isActive: false });
      return res.status(403).json({ error: 'Autenticação facial falhou' });
    }
  }

  next();
};