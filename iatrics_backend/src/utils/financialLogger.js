exports.logFinancialEvent = (
  event,
  payload
) => {

  console.log(
    `[FINANCIAL_EVENT] ${event}`,
    JSON.stringify(payload)
  );
};