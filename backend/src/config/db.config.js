const mysql = require("mysql2");
const dotenv = require("dotenv");
require("dotenv").config(); // Nạp biến môi trường từ file .env
const path = require("path");

// Cấu hình kết nối database
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Từ biến môi trường .env
  user: process.env.DB_USER, // Từ biến môi trường .env
  password: process.env.DB_PASSWORD, //
  database: process.env.DB_NAME, // Từ biến môi trường .env
  dialect: process.env.DB_DIALECT,
});

// Thực hiện kết nối
connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối database: " + err.stack);
    return;
  }
  console.log(
    "Kết nối database MySQL thành công với ID: " + connection.threadId
  );
});

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
};

