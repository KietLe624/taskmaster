const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define(
    "TaskAssignment",
    {
      // Tên model là 'TaskAssignment' (viết hoa)
      task_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
