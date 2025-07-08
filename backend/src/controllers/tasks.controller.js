const db = require("../models/index.model");
const { Op } = require("sequelize");
const { get } = require("../routers/api");
const Task = db.Task;
const Project = db.Project;
const User = db.User;

// Hàm lấy tất cả công việc (hỗ trợ lọc)
const getAllTasks = async (req, res) => {
  const Task = db.Task;
  const Project = db.Project;
  const User = db.User;

  // SỬA LẠI ĐIỀU KIỆN KIỂM TRA TỪ 'User' THÀNH 'Task'
  if (!Task) {
    return res.status(500).json({
      message: "Lỗi server: Model Task chưa được khởi tạo đúng cách.",
      troubleshooting:
        "Kiểm tra lại file src/models/tasks.model.js và src/models/index.model.js",
    });
  }

  try {
    const { name, status, priority, projectId } = req.query;
    const condition = {};

    if (name) condition.name = { [Op.like]: `%${name}%` };
    if (status) condition.status = status;
    if (priority) condition.priority = priority;
    if (projectId) condition.project_id = projectId;

    const tasks = await Task.findAll({
      where: condition,
      include: [
        { model: Project, as: "project", attributes: ["name"] },
        {
          model: User,
          as: "assignees",
          attributes: ["id", "full_name"],
          through: { attributes: [] },
        },
      ],
      order: [["due_date", "ASC"]],
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách công việc",
      error: error.message,
    });
  }
};

// Hàm lấy công việc theo ID
const getTaskByIdUser = async (req, res) => {};

module.exports = {
  getAllTasks,
};
