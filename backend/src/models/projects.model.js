const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
      manager_id: { type: DataTypes.INTEGER, allowNull: false , field: "manager_id" }, // Khóa ngoại đến User
    },
    {
      tableName: "projects",
      underscored: true,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: "manager_id",
      as: "manager",
    });
  };

  return Project;
};
