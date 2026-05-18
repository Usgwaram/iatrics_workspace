module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: DataTypes.TEXT,
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: "userId" });
    Review.belongsTo(models.Provider, { foreignKey: "providerId" });
  };

  return Review;
};
