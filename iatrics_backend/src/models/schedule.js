module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define("Schedule", {
    providerId: DataTypes.INTEGER,
    day: DataTypes.STRING,
    startTime: DataTypes.STRING,
    endTime: DataTypes.STRING,
  });

  return Schedule;
};