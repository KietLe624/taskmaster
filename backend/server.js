const express = require("express"); // Import express để tạo ứng dụng web
const app = express(); // Tạo ứng dụng express
const cors = require("cors"); // Import cors để xử lý CORS
const bodyParser = require("body-parser"); // Import body-parser để phân tích dữ liệu từ
// Middlewares
app.use(
  cors(
    {
      origin: "http://localhost:4200", // URL của ứng dụng Angular
    } // Cấu hình CORS để cho phép ứng dụng Angular truy cập API
  )
);
app.use(express.json()); // Để parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Để parse URL-encoded request bodies

const mysql = require("mysql2");

const path = require("path");
const dotenv = require("dotenv");
require("dotenv").config(); // Nạp biến môi trường từ file .env

const connection = require("./src/config/db.config"); // Import cấu hình database
const apiAdminRouter = require("./src/routers/admin"); // Import router admin
const apiRouter = require("./src/routers/api"); // Import router web
const db = require("./src/models/index.model"); // Import file index trung tâm của models
const PORT = process.env.PORT || 3000; // Từ biến môi trường .env

// Đồng bộ database
db.sequelize.sync({ force: false }).then(() => {
  console.log("Đã đồng bộ database.");
});

// Sử dụng file route chính của bạn
app.use("/api", apiRouter);
app.use("/admin", apiAdminRouter); // Sử dụng router admin

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); // Lắng nghe cổng và in ra thông báo khi server đã sẵn sàng

const cron = require("node-cron");
const {
  autoUpdateOverdueTasks,
} = require("./src/controllers/tasks.controller");

// Lập lịch để chạy hàm autoUpdateOverdueTasks
// Ví dụ: Chạy mỗi mỗi phút (* * * * *)
// Bạn có thể thay đổi lịch trình phù hợp với nhu cầu của mình.
cron.schedule("* * * * *", () => {
  console.log("Bắt đầu cron job để cập nhật trạng thái công việc quá hạn.");
  autoUpdateOverdueTasks();
});
