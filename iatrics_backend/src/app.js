const express = require('express');
const app = express();


app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
); // ✅ MUST BE FIRST
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const consultationRoutes = require('./routes/consultationRoutes'); // IMPORTANT FIX
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/wallet');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const paystackRoutes = require('./routes/paystack');

app.use('/api/auth', authRoutes);


// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/consultations', consultationRoutes); // IMPORTANT FIX
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/paystack', paystackRoutes);

module.exports = app;
