const { Provider } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /register
exports.register = async (req, res) => {
  try {
    const { name, email, password, specialization, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newProvider = await Provider.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      phone,
      isActive: true,
    });

    res.status(201).json({ message: 'Provider registered', id: newProvider.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const provider = await Provider.findOne({ where: { email } });

    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: provider.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /profile
exports.profile = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.user.id);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};
