module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      task_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      project_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.TEXT, allowNull: false },
      priority: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cate: { type: DataTypes.TEXT, allowNull: true },
      due_date: { type: DataTypes.DATE, allowNull: false },
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
      tableName: "tasks",
      underscored: true,
      timestamps: true, // Không sử dụng timestamps tự động
    }
  );

  Task.associate = (models) => {
    // Một Task thuộc về một Project
    Task.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });

    // Quan hệ nhiều-nhiều với User
    Task.belongsToMany(models.User, {
      through: models.TaskAssignment,
      foreignKey: "task_id",
      as: "assignees",
    });

    // Quan hệ một-nhiều với bảng trung gian TaskAssignment
    Task.hasMany(models.TaskAssignment, {
      foreignKey: "task_id",
      as: "assignments",
    });

    // THÊM QUAN HỆ NÀY VÀO
    // Một Task có nhiều bản ghi lịch sử trạng thái
    Task.hasMany(models.TaskStatus, {
      foreignKey: "task_id",
      as: "statusHistory",
    });
  };
  return Task;
};
