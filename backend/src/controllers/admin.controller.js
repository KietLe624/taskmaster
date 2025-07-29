const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const Role = db.Role;
const { Op } = db.Sequelize;

/**
 * Lấy các số liệu thống kê tổng quan cho dashboard của admin.
 */
const getDashboardStats = async (req, res) => {
  try {
    const [userCount, projectCount, taskCount] = await Promise.all([
      User.count(),
      Project.count(),
      Task.count(),
    ]);
    res.status(200).json({ userCount, projectCount, taskCount });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi lấy dữ liệu thống kê.", error: error.message });
  }
};

/**
 * Lấy danh sách tất cả người dùng với tùy chọn tìm kiếm và phân trang.
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { full_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: offset,
      attributes: { exclude: ["password"] }, // Luôn loại bỏ mật khẩu khỏi kết quả
      include: [
        {
          model: Role,
          as: "roles", // Bí danh từ model User
          attributes: ["name"],
          through: { attributes: [] }, // Không lấy thông tin từ bảng trung gian
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      totalItems: count,
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi lấy danh sách người dùng.",
      error: error.message,
    });
  }
};

/**
 * Cập nhật thông tin và vai trò của một người dùng.
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Nhận một mảng các tên role, vd: ['member', 'manager']
    const { full_name, email, roles } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "Không tìm thấy người dùng." });
    }

    // Cập nhật các thông tin cơ bản
    await user.update({ full_name, email });

    // Nếu có mảng 'roles' được gửi lên, cập nhật vai trò
    if (roles && Array.isArray(roles)) {
      const roleObjects = await Role.findAll({
        where: { name: { [Op.in]: roles } },
      });
      // setRoles sẽ xóa các vai trò cũ và gán các vai trò mới
      await user.setRoles(roleObjects);
    }

    res.status(200).send({ message: "Cập nhật người dùng thành công." });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi cập nhật người dùng.", error: error.message });
  }
};

/**
 * Xóa một người dùng khỏi hệ thống.
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const count = await User.destroy({ where: { user_id: userId } });

    if (count > 0) {
      res.status(200).send({ message: "Xóa người dùng thành công." });
    } else {
      res.status(404).send({ message: "Không tìm thấy người dùng để xóa." });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi xóa người dùng.", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
};
