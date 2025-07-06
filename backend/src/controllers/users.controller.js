const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User; // Lấy model User từ đối tượng db
const Project = db.Project; // Lấy model Projects từ đối tượng db

const getAllUsers = async (req, res) => {
  try {
    // Tương đương với User.find() của Mongoose
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Ví dụ: loại bỏ trường password
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Loại bỏ trường password
    });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

// Hàm mới: Đếm số lượng dự án một user đang quản lý
const getManagedProjectCount = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy ID của user từ URL
    const count = await Project.count({
      where: {
        manager_id: userId,
      },
    });
    res.status(200).json({ count: count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đếm số dự án", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getManagedProjectCount,
};
