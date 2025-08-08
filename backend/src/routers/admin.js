const express = require("express");
const router = express.Router(); // Sử dụng express.Router() để tạo một router mới
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");
const {
  getDashboardStats,
  updateUser,
  deleteUser,
} = require("../controllers/admin.controller");

// Middleware để xác thực token và kiểm tra quyền admin

router.get("/dashboards", authenticateToken, isAdmin, getDashboardStats);
router.patch("/users/:id", authenticateToken, isAdmin, updateUser);
router.delete("/users/:id", authenticateToken, isAdmin, deleteUser);
module.exports = router;
