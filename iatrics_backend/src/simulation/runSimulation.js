const ConsultationSimulator = require("./consultationSimulator");

(async () => {
  const sim = new ConsultationSimulator(
    "https://wok-capillary-conform.ngrok-free.dev"
  );

  const result = await sim.run();

  console.log("🎯 FINAL RESULT:", result);
})();