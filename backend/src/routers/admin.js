const express = require("express");
const router = express.Router(); // Sử dụng express.Router() để tạo một router mới
const { isAdmin } = require("../middleware/auth.middleware");
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/admin.controller");

// Middleware để xác thực token và kiểm tra quyền admin

router.get("/admin", isAdmin, getDashboardStats);
router.get("/users", isAdmin, getAllUsers);
router.put("/users/:id", isAdmin, updateUser);
router.delete("/users/:id", isAdmin, deleteUser);

module.exports = router;
