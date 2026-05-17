const getTransaction = (customTransaction = null) => {
  return (
    customTransaction ||
    global.testTransaction ||
    undefined
  );
};

module.exports = {
  getTransaction,
};