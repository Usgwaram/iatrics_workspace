const validate = (fn, name) => {
  if (!fn) {
    throw new Error(`❌ Missing controller: ${name}`);
  }
  return fn;
};

module.exports = validate;