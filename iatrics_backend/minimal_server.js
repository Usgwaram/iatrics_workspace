const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

/* ------------------ HEALTH CHECK ------------------- */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Iatrics Minimal Server",
    time: new Date()
  });
});

/* ------------------ AUTH (FAKE LOGIN) ------------------- */
app.post("/auth/login", (req, res) => {
  const { email } = req.body;

  res.json({
    token: "FAKE-TOKEN-123456",
    user: {
      id: 1,
      email: email || "test@iatrics.com",
      role: "user"
    }
  });
});

/* ------------------ PROVIDERS LIST ------------------- */
app.get("/providers", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Dr. Amina Yusuf",
      specialty: "General Practice",
      price: 5000,
      available: true
    },
    {
      id: 2,
      name: "Dr. Musa Bello",
      specialty: "Pediatrics",
      price: 7000,
      available: true
    },
    {
      id: 3,
      name: "Dr. Sadiq Lawal",
      specialty: "Cardiology",
      price: 12000,
      available: false
    }
  ]);
});

/* ------------------ CREATE BOOKING ------------------- */
app.post("/bookings", (req, res) => {
  const { userId, providerId, time } = req.body;

  res.json({
    success: true,
    booking: {
      id: Math.floor(Math.random() * 10000),
      userId,
      providerId,
      time,
      status: "CONFIRMED"
    }
  });
});

/* ------------------ VIEW BOOKINGS ------------------- */
app.get("/bookings", (req, res) => {
  res.json([
    {
      id: 101,
      providerName: "Dr. Amina Yusuf",
      time: "2025-11-30 10:00 AM",
      status: "CONFIRMED"
    }
  ]);
});

/* ------------------ START SERVER ------------------- */
app.listen(port, () => {
  console.log(`✅ Iatrics Minimal Server is running on port ${port}`);
});

