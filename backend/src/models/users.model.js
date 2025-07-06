const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // Tên model là 'User' (viết hoa)
      username: { type: DataTypes.TEXT, allowNull: false },
      email: { type: DataTypes.TEXT, allowNull: false },
      password: { type: DataTypes.TEXT, allowNull: false },
      full_name: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: true },
      phone_number: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "users",
      underscored: true,
    }
  );

  User.associate = (models) => {
    // Một User có thể quản lý nhiều Project
    // Lưu ý: models.Project (viết hoa) vì key trong db object là tên model
    User.hasMany(models.Project, {
      foreignKey: "manager_id",
      as: "managedProjects",
    });
  };

  return User;
};
