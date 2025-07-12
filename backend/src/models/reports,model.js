const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define(
        "Report",
    {   
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Khóa chính
        content: { type: DataTypes.TEXT, allowNull: false },
        // status: { type: DataTypes.STRING, allowNull: false },
        project_id: { type: DataTypes.INTEGER, allowNull: false },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        tableName: "reports",
        underscored: true,
    });
    Report.associate = (models) => {
        // Một Report thuộc về một Project
        Report.belongsTo(models.Project, {
            foreignKey: "project_id",
            as: "projects",
        });

        // Một Report được tạo bởi một User
        Report.belongsTo(models.User, {
            foreignKey: "created_by",
            as: "users",
        });
    };
    return Report;
};
