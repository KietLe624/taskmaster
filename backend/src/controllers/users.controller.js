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

const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.user_id; // Lấy ID người dùng từ tham số URL
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Loại bỏ trường password
    });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
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

const updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        message: "Bạn cần đăng nhập để cập nhật thông tin người dùng.",
      });
    }
    const userId = req.user.user_id;
    const { full_name, email, phone_number, address } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    // Cập nhật thông tin
    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.address = address || user.address;

    // Kiểm tra họ và tên không được để trống
    if (!user.full_name) {
      return res
        .status(400)
        .json({ message: "Vui lòng không để trống họ và tên." });
    }
    // Kiểm tra email có hợp lệ và chưa được sử dụng
    if (user.email) {
      const emailExists = await User.findOne({ where: { email: user.email } });
      if (emailExists && emailExists.user_id !== userId) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }
    }
    await user.save(); // Chỉ lưu khi full_name hợp lệ
    res.status(200).json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserInfo,
  getManagedProjectCount,
  updateUser,
};
