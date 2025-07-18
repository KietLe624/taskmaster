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

    // Một Task có thể được giao cho nhiều User (Many-to-Many)
    Task.belongsToMany(models.User, {
      through: "TaskAssignments",
      as: "assignees",
      foreignKey: "task_id",
      otherKey: "user_id",
    });

    // Một Task có thể có nhiều TaskAssignments
    Task.hasMany(models.TaskAssignment, {
      foreignKey: "task_id",
      as: "assignments",
    });
  };
  return Task;
};
