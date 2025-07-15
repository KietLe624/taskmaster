const db = require("../models/index.model");
const { Op } = require("sequelize");
const { get } = require("../routers/api");
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const TaskAssignment = db.TaskAssignment;

// Hàm lấy tất cả công việc (hỗ trợ lọc)
const getAllTasks = async (req, res) => {
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
          attributes: ["user_id", "full_name"],
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

// Lấy tất cả công việc được giao cho người dùng đã đăng nhập
const getTasks = async (req, res) => {
  try {
    // Lấy ID người dùng từ token đã được xác thực
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    // 1. Tìm tất cả các task_id được gán cho user hiện tại trong bảng trung gian
    const assignments = await TaskAssignment.findAll({
      where: { user_id: currentUserId },
      attributes: ["task_id"], // Chỉ cần lấy cột task_id
    });

    // Trích xuất các ID thành một mảng đơn giản
    const taskIds = assignments.map((a) => a.task_id);

    // Nếu người dùng không có công việc nào, trả về một mảng rỗng
    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Lấy tất cả các công việc có ID nằm trong danh sách đã tìm được ở trên
    const tasks = await Task.findAll({
      where: {
        task_id: taskIds,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "assignees",
          attributes: ["user_id", "full_name", "email"],
          through: { attributes: [] }, // Bỏ qua các cột của bảng trung gian
        },
      ],
      order: [["due_date", "ASC"]], // Sắp xếp theo hạn chót gần nhất
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("[GET TASKS BY USER ERROR]", error);
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách công việc của bạn",
        error: error.message,
      });
  }
};

const updateStatusTask = async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Debug
  console.log("Task ID from params:", req.params.id); // Kiểm tra taskId
  try {
    const taskId = req.params.id; // Lấy taskId từ URL
    console.log(`Updating status for task ID: ${taskId}`); // Debug
    const { status } = req.body; // Lấy trạng thái mới từ body
    // Kiểm tra dữ liệu đầu vào
    if (!status) {
      return res
        .status(400)
        .json({ message: "Trạng thái không được để trống" });
    }
    // Tìm và cập nhật task
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại" });
    }
    await task.update({ status }); // Cập nhật trạng thái
    res.status(200).json({
      message: `Cập nhật trạng thái task ${taskId} thành ${status} thành công`,
      data: task,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTasks,
  updateStatusTask,
};
