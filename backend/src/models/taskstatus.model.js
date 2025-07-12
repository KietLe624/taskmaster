const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define(
    "TaskStatus",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khóa chính
      task_id: { type: DataTypes.INTEGER, allowNull: false },
      old_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      new_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      chagned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "task_status_history",
      underscored: true,
    }
  );

  TaskStatus.associate = (models) => {
    // Một TaskStatus có nhiều Task
    TaskStatus.hasMany(models.Task, {
      foreignKey: "task_id",
      as: "tasks",
    });
  };

  return TaskStatus;
};
