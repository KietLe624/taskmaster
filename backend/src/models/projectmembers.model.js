const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProjectMember = sequelize.define(
    "ProjectMember",
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      project_id: { type: DataTypes.INTEGER, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false }, // Ví dụ: 'member', 'admin'
      add_at: { type: DataTypes.DATE, allowNull: false }, // Ngày thêm thành viên
    },
    {
      tableName: "projectmembers",
      underscored: true,
    }
  );
  ProjectMember.associate = (models) => {
    // Một ProjectMember thuộc về một User
    ProjectMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "users",
    });

    // Một ProjectMember thuộc về một Project
    ProjectMember.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "projects",
    });
  };
  return ProjectMember;
};
