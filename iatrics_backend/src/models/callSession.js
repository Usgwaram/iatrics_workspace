module.exports = (sequelize, DataTypes) => {
  const CallSession = sequelize.define("CallSession", {
    channelName: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    cost: DataTypes.FLOAT,
    status: DataTypes.STRING,
  });

  return CallSession;
};