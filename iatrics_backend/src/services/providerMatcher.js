const { Provider } = require("../models");

async function findBestProvider(specialty = null) {
  let query = {
    where: { isOnline: true },
    order: [["lastActiveAt", "DESC"]],
  };

  if (specialty) {
    query.where.specialty = specialty;
  }

  const providers = await Provider.findAll(query);

  if (!providers.length) return null;

  // simple load balancing (can upgrade later)
  return providers[0];
}

module.exports = { findBestProvider };