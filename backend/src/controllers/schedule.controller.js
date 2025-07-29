const db = require("../models/index.model");
const { Op } = require("sequelize");

const Task = db.Task;
const TaskAssignment = db.TaskAssignment;
const Project = db.Project;

// Hàm lấy ngày bắt đầu (Thứ Hai) và kết thúc (Chủ Nhật) của tuần hiện tại
const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day; // Tính khoảng cách đến Thứ Hai

  const monday = new Date(now.setDate(now.getDate() + diffToMonday));
  monday.setHours(0, 0, 0, 0); // Bắt đầu ngày

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // Kết thúc ngày

  return { startOfWeek: monday, endOfWeek: sunday };
};

const getScheduleForWeek = async (req, res) => {
  try {
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const { startOfWeek, endOfWeek } = getWeekRange();

    const scheduledTasks = await Task.findAll({
      attributes: ["name", "start_time", "due_date"],
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          where: { user_id: currentUserId },
          attributes: [],
          required: true,
        },
        // ✅ KHỐI INCLUDE CHO PROJECT ĐÃ ĐƯỢC XÓA BỎ TẠI ĐÂY
      ],
      where: {
        start_time: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      order: [["start_time", "ASC"]],
    });

    res.status(200).json(scheduledTasks);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu lịch trình:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch trình." });
  }
};

module.exports = {
  getScheduleForWeek,
};
