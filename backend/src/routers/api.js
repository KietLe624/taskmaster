const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

// Import các controller cần thiết
const {
  getAllUsers,
  getUserById,
  getManagedProjectCount,
} = require("../controllers/users.controller");
// Import các controller cho projects
const {
  countProjects,
  getAllProjects,
} = require("../controllers/projects.controller");
// Import các controller cho dashboard
const {
  getDashboardData,
  countProjectsDashboard,
} = require("../controllers/dashboard.controller");

router.use(cors()); // Sử dụng cors cho tất cả các route
router.use(bodyParser.urlencoded({ extended: true })); // Phân tích dữ liệu từ form

// Route để lấy tất cả dự án trên dashboard
router.get("/", getDashboardData);
router.get("/dashboard", getDashboardData);
// router.get("/dashboard/:id/countProjectById", countProjectsDashboard); // Route để đếm số lượng dự án trên dashboard

// Route để lấy tất cả người dùng
router.get("/users", getAllUsers);
// Route để lấy người dùng theo ID
router.get("/users/:id", getUserById);
// Route để đếm số lượng dự án mà người dùng đang quản lý
router.get("/users/:id/countManagedProjects", getManagedProjectCount);
// =============================================

router.get("/projects", getAllProjects); // Route để lấy tất cả dự án
router.get("/projects/count", countProjects); // Route để đếm số lượng dự án
// =============================================

module.exports = router;
