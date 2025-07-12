const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khóa chính
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "manager_id",
      }, // Khóa ngoại đến User
    },
    {
      tableName: "projects",
      underscored: true,
    }
  );

  Project.associate = (models) => {
    // Truy cập thông tin người quản lý dự án thông qua bí danh 'manager', khoá ngoại là 'manager_id'
    Project.belongsTo(models.User, {
      foreignKey: "manager_id",
      as: "manager",
    });
    // Quan hệ với bảng Project Member
    Project.hasMany(models.ProjectMember, {
      foreignKey: "project_id",
      as: "members",
    });
    // Quan hệ với bảng Task
    Project.hasMany(models.Task, {
      foreignKey: "project_id",
      as: "tasks",
    });
  };

  return Project;
};
