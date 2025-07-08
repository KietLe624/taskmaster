const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/auth.middleware");

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
const { getDashboardData } = require("../controllers/dashboard.controller");
// Import các controller cho auth
const { register, login } = require("../controllers/auth.controller");
// controller cho tasks
const { getAllTasks } = require("../controllers/tasks.controller");

// ============================================= //
router.use(cors()); // Sử dụng cors cho tất cả các route
router.use(bodyParser.urlencoded({ extended: true })); // Phân tích dữ liệu từ form

// Route để lấy tất cả dự án trên dashboard
router.get("/", authenticateToken, getDashboardData);
router.get("/dashboard", authenticateToken, getDashboardData);

// Route để lấy tất cả người dùng
router.get("/users", getAllUsers);
// Route để lấy người dùng theo ID
router.get("/users/:id", getUserById);
// Route để đếm số lượng dự án mà người dùng đang quản lý
router.get("/users/:id/countManagedProjects", getManagedProjectCount);
// ============================================= //

router.get("/projects", getAllProjects); // Route để lấy tất cả dự án
router.get("/projects/count", countProjects); // Route để đếm số lượng dự án
// ============================================= //
// Route đăng ký người dùng
router.post("/auth/register", register);
// Route đăng nhập người dùng
router.post("/auth/signin", login);

// ============================================= //
router.get("/tasks", getAllTasks); // Route để lấy tất cả tasks

module.exports = router;
