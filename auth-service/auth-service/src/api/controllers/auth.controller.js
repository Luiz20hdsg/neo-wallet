const User = require('../models/User');
const { sendOTP } = require('../services/otp.service');

exports.signup = async (req, res) => {
  try {
    const { fullName, cpf, email, phone } = req.body;

    // Validação básica (CPF, e-mail, etc.)
    if (!isValidCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ $or: [{ cpf }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já cadastrado' });
    }

    // Cria usuário não verificado
    const user = new User({ fullName, cpf, email, phone });
    await user.save();

    // Envia OTP por SMS/e-mail
    const otp = await sendOTP(phone, email);

    // Salva OTP no Redis (exemplo: chave `otp:${userId}`)
    await redisClient.set(`otp:${user._id}`, otp, 'EX', 300); // Expira em 5 minutos

    res.status(201).json({ 
      message: 'OTP enviado. Verifique seu e-mail/SMS.',
      userId: user._id 
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro no cadastro' });
  }
};