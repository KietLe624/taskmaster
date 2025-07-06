"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const dbConfig = require("../config/db.config.js");
const db = {};

if (!dbConfig.dialect) {
  throw new Error(
    "Lỗi cấu hình: Dialect của database chưa được định nghĩa trong file .env (DB_DIALECT)"
  );
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

// Tự động đọc tất cả các file model trong thư mục này
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-9) === ".model.js"
    );
  })
  .forEach((file) => {
    console.log(`[DEBUG] Đang nạp model từ file: ${file}`); // LOG GỠ LỖI
    try {
      const modelDefinition = require(path.join(__dirname, file));

      if (typeof modelDefinition !== "function") {
        // Nếu file không export ra một hàm, báo lỗi ngay lập tức
        throw new Error(
          `File model '${file}' không export ra một hàm! Vui lòng kiểm tra lại cấu trúc file.`
        );
      }

      const model = modelDefinition(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } catch (error) {
      console.error(`\n!!!!!!!!!! LỖI KHI NẠP FILE MODEL: ${file} !!!!!!!!!!`);
      console.error(error);
      // Dừng server và báo lỗi để bạn có thể sửa
      throw new Error(
        `Không thể nạp model từ file ${file}. Chi tiết lỗi ở trên.`
      );
    }
  });

// Gọi hàm 'associate' cho từng model (nếu có) để thiết lập mối quan hệ
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
