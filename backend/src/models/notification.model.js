const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khóa chính
      user_id: { type: DataTypes.INTEGER, allowNull: false }, // ID người dùng nhận thông báo
      task_id: { type: DataTypes.INTEGER, allowNull: true }, // ID công việc liên kết (nếu có)
      type: { type: DataTypes.STRING, allowNull: false }, // Loại thông báo
      message: { type: DataTypes.TEXT, allowNull: false }, // Nội dung thông báo
      status_read: { type: DataTypes.BOOLEAN, defaultValue: false }, // Trạng thái đã đọc
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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
    // Một Notification có thể liên kết với một Task
    Notification.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });
  };
  return Notification;
};
