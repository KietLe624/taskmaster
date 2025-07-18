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
  updateUser,
} = require("../controllers/users.controller");
// Import các controller cho projects
const {
  getAllProjects,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projects.controller");
// Import các controller cho dashboard
const { getDashboardData } = require("../controllers/dashboard.controller");
// Import các controller cho auth
const { register, login } = require("../controllers/auth.controller");
// controller cho tasks
const {
  getTasks,
  createTask,
  updateStatusTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks.controller");

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
router.put("/users/:id", authenticateToken, updateUser); // Cập nhật thông tin người dùng

// ============================================= //
router.get("/projects/all", getAllProjects); // Lấy tất cả dự án
router.get("/projects", authenticateToken, getProjects); // Lấy danh sách dự án
router.get("/projects/:id", authenticateToken, getProjectById); // Lấy dự án theo ID, bao gồm thông tin thành viên và tiến độ
router.post("/projects", authenticateToken, createProject); // Tạo dự án mới
router.put("/projects/:id", authenticateToken, updateProject); // Cập nhật dự án
router.delete("/projects/:id", authenticateToken, deleteProject); // Xóa dự án
// ============================================= //
// Route đăng ký người dùng
router.post("/auth/register", register);
// Route đăng nhập người dùng
router.post("/auth/signin", login);

// ============================================= //
router.get("/tasks", authenticateToken, getTasks); // Route để lấy task theo ID
router.post("/tasks", authenticateToken, createTask); // Route để tạo task mới
router.patch("/taskStatus/:id", authenticateToken, updateStatusTask); // Route để cập nhật trạng thái task
router.put("/tasks/:id", authenticateToken, updateTask); // Route để cập nhật task
router.delete("/tasks/:id", authenticateToken, deleteTask); // Route để xoá task
// ============================================= //


module.exports = router;
