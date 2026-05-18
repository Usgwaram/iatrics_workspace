module.exports = (sequelize, DataTypes) => {
  const Consultation = sequelize.define("Consultation", {
    userId: DataTypes.INTEGER,
    providerId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    channelName: DataTypes.STRING,
    symptoms: DataTypes.TEXT,
    appointmentDate: DataTypes.DATEONLY,
    appointmentTime: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    fee: DataTypes.FLOAT,
    price: DataTypes.FLOAT,
    status: DataTypes.STRING,
  });

  return Consultation;
};
