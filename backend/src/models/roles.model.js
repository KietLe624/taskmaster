module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      // Định nghĩa khóa chính là 'role_id' để khớp với schema
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    
    },
    {
      tableName: "roles", // Chỉ định rõ tên bảng
      underscored: true, // Tự động chuyển camelCase (vd: roleId) thành snake_case (vd: role_id)
    }
  );

  Role.associate = (models) => {
    // Thiết lập mối quan hệ nhiều-nhiều với User
    Role.belongsToMany(models.User, {
      through: "user_roles",
      foreignKey: "role_id", // Khóa ngoại trong bảng trung gian trỏ đến Role
      otherKey: "user_id",
    });
  };

  return Role;
};
