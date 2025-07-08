module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khớp với schema
      project_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.TEXT, allowNull: false },
      priority: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      due_date: { type: DataTypes.DATE, allowNull: false }, // Đổi thành DATE để khớp TIMESTAMP
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
      // Giữ lại underscored để nó xử lý các khóa ngoại nếu cần
      underscored: true,
      // Không cần Sequelize tự động quản lý timestamps nữa vì chúng ta đã định nghĩa ở trên
      timestamps: true,
    }
  );

  Task.associate = (models) => {
    // Một Task thuộc về một Project
    Task.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });

    // Một Task có thể được giao cho nhiều User (Many-to-Many)
    // Task.belongsToMany(models.User, {
    //   through: "TaskAssignments", // Tên bảng trung gian
    //   foreignKey: "id",
    //   otherKey: "user_id",
    //   as: "assignees",
    // });
    
    // Một Task có thể có nhiều TaskAssignments
    Task.hasMany(models.TaskAssignment, {
      foreignKey: "task_id",
      as: "assignments",
    });
  };
  return Task;
};
