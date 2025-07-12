const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khóa chính
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      status_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "notifications",
      underscored: true,
    }
  );
  Notification.associate = (models) => {
    // Một Notification thuộc về một User
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "users",
    });
  };
    return Notification;
};
