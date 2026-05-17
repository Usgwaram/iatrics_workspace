exports.logFinancialEvent = (
  event,
  data
) => {
  console.log(
    `[FINANCIAL] ${event}`,
    JSON.stringify(data)
  );
};