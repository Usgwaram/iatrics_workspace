const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "staging"
    ? ".env.staging"
    : process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env";

require("dotenv").config({
  path: envFile,
  override: true,
  quiet: true,
});

const databaseUrlHost = (() => {
  if (!process.env.DATABASE_URL) return "";

  try {
    return new URL(process.env.DATABASE_URL).hostname;
  } catch (_) {
    return "";
  }
})();

const isLocalDatabaseHost = ["localhost", "127.0.0.1", "::1"].includes(
  databaseUrlHost
);

const useStagingSsl =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" &&
    Boolean(process.env.DATABASE_URL) &&
    !isLocalDatabaseHost);

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {},
  },

  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {},
  },

  staging: {
    use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: useStagingSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  },

  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
