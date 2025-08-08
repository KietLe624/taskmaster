const { where } = require("sequelize");
const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const TaskAssignment = db.TaskAssignment;
const Notification = db.Notification;
const ProjectMember = db.ProjectMember;

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

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // lấy từ URL
    const { full_name, email, phone_number, address } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Cập nhật thông tin
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;
    if (address) user.address = address;

    if (!user.full_name) {
      return res
        .status(400)
        .json({ message: "Vui lòng không để trống họ và tên." });
    }

    if (email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.user_id !== Number(userId)) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }
    }

    await user.save();
    res.status(200).json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};

// Xóa người dùng và tất cả tác vụ liên quan
const deleteUser = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.params.id; // Lấy ID từ URL

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).send({ message: "Không tìm thấy người dùng." });
    }

    // Kiểm tra và xóa các bản ghi trong TaskAssignment nếu có
    const taskAssignmentCount = await TaskAssignment.count({
      where: { user_id: userId },
      transaction: t,
    });
    if (taskAssignmentCount > 0) {
      await TaskAssignment.destroy({
        where: { user_id: userId },
        transaction: t,
      });
    }

    // Kiểm tra và xóa các bản ghi trong Notification nếu có
    const notificationCount = await Notification.count({
      where: { user_id: userId },
      transaction: t,
    });
    if (notificationCount > 0) {
      await Notification.destroy({
        where: { user_id: userId },
        transaction: t,
      });
    }

    // Kiểm tra và xóa các bản ghi trong Project nếu có
    const projectCount = await Project.count({
      where: { manager_id: userId },
      transaction: t,
    });
    if (projectCount > 0) {
      await Project.destroy({ where: { manager_id: userId }, transaction: t });
    }

    // Kiểm tra và xóa các bản ghi trong ProjectMember nếu có
    const projectMemberCount = await ProjectMember.count({
      where: { user_id: userId },
      transaction: t,
    });
    if (projectMemberCount > 0) {
      await ProjectMember.destroy({
        where: { user_id: userId },
        transaction: t,
      });
    }

    // Xóa người dùng
    await user.destroy({ transaction: t });
    await t.commit();

    res.status(200).send({
      message: `Người dùng ${userId} và các tác vụ liên quan đã được xóa thành công.`,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Lỗi khi xóa người dùng:", error);
    res
      .status(500)
      .send({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
module.exports = {
  getDashboardStats,
  updateUser,
  deleteUser,
};
