const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // Tên model là 'User' (viết hoa)
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, // Khóa chính
      },
      username: { type: DataTypes.TEXT, allowNull: false },
      email: { type: DataTypes.TEXT, allowNull: false },
      password: { type: DataTypes.TEXT, allowNull: false },
      full_name: { type: DataTypes.TEXT, allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      phone_number: { type: DataTypes.TEXT, allowNull: true },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at", // Ánh xạ đến cột created_at trong DB
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at", // Ánh xạ đến cột updated_at trong DB
      },
    },
    {
      tableName: "users",
      // underscored: true,
    }
  );
  // Định nghĩa các quan hệ giữa User và các model khác
  User.associate = (models) => {
    // Một User có thể quản lý nhiều Project
    User.hasMany(models.Project, {
      foreignKey: "manager_id",
      as: "managedProjects",
    });
    // Một User có thể là có nhiều Task
    User.belongsToMany(models.Task, {
      through: "TaskAssignments",
      foreignKey: "user_id",
      otherKey: "task_id",
      as: "assignedTasks",
    });
  };

  return User;
};
