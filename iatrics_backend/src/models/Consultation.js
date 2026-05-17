module.exports = (sequelize, DataTypes) => {
  const Consultation = sequelize.define("Consultation", {
    userId: DataTypes.INTEGER,
    providerId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    channelName: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    fee: DataTypes.FLOAT,
    status: DataTypes.STRING,
  });

  return Consultation;
};
