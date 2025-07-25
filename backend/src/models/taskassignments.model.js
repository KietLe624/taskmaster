const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define(
    "TaskAssignment",
    {
      // Tên model là 'TaskAssignment' (viết hoa)
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      task_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
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
      tableName: "taskassignments",
      underscored: true,
    }
  );
  TaskAssignment.associate = (models) => {
    // Một TaskAssignment thuộc về một Task
    TaskAssignment.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });

    // Một TaskAssignment thuộc về một User
    TaskAssignment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return TaskAssignment;
};
