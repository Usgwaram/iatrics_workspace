const bcrypt = require("bcrypt");
const db = require("../src/models");
const {
  calculatePaymentSplit,
  splitPayment,
} = require("../src/services/commissionService");

describe("20% app commission", () => {
  test("splits consultation payment into 20% app commission and 80% provider earning", () => {
    const split = calculatePaymentSplit(5000);

    expect(split.amount).toBe(5000);
    expect(split.commissionRate).toBe(0.2);
    expect(split.commission).toBe(1000);
    expect(split.providerEarning).toBe(4000);
  });

  test("rounds commission and provider earning to currency precision", () => {
    const split = calculatePaymentSplit(1000.55);

    expect(split.commission).toBe(200.11);
    expect(split.providerEarning).toBe(800.44);
  });

  test("rejects invalid payment amounts", () => {
    expect(() => calculatePaymentSplit(0)).toThrow("Invalid payment amount");
    expect(() => calculatePaymentSplit("bad")).toThrow("Invalid payment amount");
  });

  test("writes provider earning and app commission records", async () => {
    const patient = await db.User.create(
      {
        fullName: "Patient",
        email: `patient_${Date.now()}@test.com`,
        phone: "08000000001",
        password: await bcrypt.hash("Password123!", 10),
      },
      { transaction: global.testTransaction }
    );
    const providerUser = await db.User.create(
      {
        fullName: "Provider",
        email: `provider_${Date.now()}@test.com`,
        phone: "08000000002",
        password: await bcrypt.hash("Password123!", 10),
      },
      { transaction: global.testTransaction }
    );
    const provider = await db.Provider.create(
      {
        userId: providerUser.id,
        specialty: "General Medicine",
        licenseNumber: `COMMISSION-${Date.now()}`,
      },
      { transaction: global.testTransaction }
    );

    const result = await splitPayment({
      userId: patient.id,
      providerId: provider.id,
      amount: 5000,
      reference: `PAY_${Date.now()}`,
      tx: global.testTransaction,
    });

    expect(result.commission).toBe(1000);
    expect(result.providerEarning).toBe(4000);

    const transactions = await db.WalletTransaction.findAll({
      order: [["amount", "ASC"]],
      transaction: global.testTransaction,
    });

    expect(transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: patient.id,
          amount: 1000,
          type: "credit",
          status: "confirmed",
          source: "commission",
        }),
        expect.objectContaining({
          userId: providerUser.id,
          amount: 4000,
          type: "credit",
          status: "confirmed",
          source: "provider_earning",
        }),
      ])
    );
  });
});
