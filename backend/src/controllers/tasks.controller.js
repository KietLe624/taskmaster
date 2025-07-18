const db = require("../models/index.model");
const { Op } = require("sequelize");
const { get } = require("../routers/api");
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const TaskAssignment = db.TaskAssignment;
const sequelize = db.sequelize;

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
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    // Lấy các tham số lọc và sắp xếp từ query string
    const { name, status, priority, sortBy, sortOrder } = req.query;

    // --- Xây dựng các điều kiện ---
    const whereCondition = {}; // Điều kiện cho bảng tasks
    const orderCondition = []; // Điều kiện sắp xếp

    // Lọc theo tên, trạng thái, độ ưu tiên
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    if (status && status !== "all") {
      whereCondition.status = status;
    }
    if (priority && priority !== "all") {
      whereCondition.priority = priority;
    }

    // Sắp xếp
    if (sortBy) {
      orderCondition.push([sortBy, sortOrder || "ASC"]);
    } else {
      orderCondition.push(["due_date", "ASC"]); // Mặc định
    }

    // --- Lấy ID các task được giao cho user ---
    const assignments = await db.TaskAssignment.findAll({
      where: { user_id: currentUserId },
      attributes: ["task_id"],
    });
    const taskIds = assignments.map((a) => a.task_id);

    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }
    whereCondition.task_id = { [Op.in]: taskIds };

    const tasks = await Task.findAll({
      where: whereCondition,
      include: [
        { model: db.Project, as: "project", attributes: ["id", "name"] },
        {
          model: db.User,
          as: "assignees",
          attributes: ["user_id", "full_name"],
          through: { attributes: [] },
        },
      ],
      order: orderCondition,
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("[GET TASKS BY USER ERROR]", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách công việc của bạn",
      error: error.message,
    });
  }
};

// tạo công việc mới
const createTask = async (req, res) => {
  console.log("--- SERVER ĐÃ NHẬN ĐƯỢC DỮ LIỆU ---");
  console.log(req.body);
  console.log("---------------------------------");
  const t = await sequelize.transaction();
  try {
    const {
      name,
      description,
      status,
      priority,
      cate,
      due_date,
      project_id,
      assignee_id,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !name ||
      !status ||
      !priority ||
      !cate ||
      !due_date ||
      !project_id ||
      !assignee_id
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ các trường bắt buộc." });
    }

    // Tạo công việc mới trong transaction
    const newTask = await Task.create(
      {
        name,
        description,
        status,
        priority,
        cate,
        due_date,
        project_id,
      },
      { transaction: t }
    );

    if (assignee_id) {
      await newTask.setAssignees(assignee_id, { transaction: t });
    }
    await t.commit();

    const result = await Task.findByPk(newTask.task_id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        {
          model: User,
          as: "assignees",
          attributes: ["user_id", "full_name"],
          through: { attributes: [] },
        },
      ],
    });
    res.status(201).json({
      message: "Công việc đã được tạo thành công",
      data: result,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi tạo công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

// cập nhật trạng thái công việc
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

// Cập nhật thông tin công việc
const updateTask = async (req, res) => {
  const t = await sequelize.transaction(); // Bắt đầu transaction
  try {
    const taskId = req.params.id;
    // Lấy tất cả các trường có thể cập nhật từ body
    const {
      name,
      description,
      priority,
      cate,
      due_date,
      project_id,
      assignee_id,
    } = req.body;

    // 1. Kiểm tra các trường thực sự bắt buộc
    if (!name || !due_date || !project_id) {
      return res
        .status(400)
        .json({ message: "Tên, ngày hết hạn, và dự án là bắt buộc." });
    }

    // 2. Tìm công việc cần cập nhật
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    // 3. Cập nhật các trường thông tin của công việc
    await task.update(
      {
        name,
        description,
        priority,
        cate,
        due_date,
        project_id,
      },
      { transaction: t }
    );

    // 4. Cập nhật người thực hiện (nếu có)
    if (assignee_id) {
      await task.setAssignees([assignee_id], { transaction: t });
    }

    // 5. Commit transaction nếu mọi thứ thành công
    await t.commit();

    // 6. Trả về kết quả thành công
    const updatedTask = await Task.findByPk(taskId, {
      include: ["project", "assignees"],
    });

    res.status(200).json({
      message: `Cập nhật công việc #${taskId} thành công.`,
      data: updatedTask,
    });
  } catch (error) {
    // Nếu có lỗi, rollback tất cả thay đổi
    await t.rollback();
    console.error("Lỗi khi cập nhật công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
// xoá công việc
const deleteTask = async (req, res) => {
  const t = await sequelize.transaction(); // Bắt đầu một transaction
  try {
    const taskId = req.params.id;

    // Tìm công việc cần xóa
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    // BƯỚC 1: Xóa tất cả các liên kết trong bảng trung gian `TaskAssignments`
    // Dùng setAssignees với một mảng rỗng là cách của Sequelize để xóa các liên kết
    await task.setAssignees([], { transaction: t });

    // BƯỚC 2: Sau khi các "hàng con" đã bị xóa, giờ mới xóa "hàng cha"
    await task.destroy({ transaction: t });

    // Nếu cả 2 bước trên thành công, commit transaction
    await t.commit();

    res
      .status(200)
      .json({
        message: `Công việc #${taskId} và các phân công liên quan đã được xoá.`,
      });
  } catch (error) {
    // Nếu có bất kỳ lỗi nào, hủy bỏ tất cả thay đổi
    await t.rollback();
    console.error("Lỗi khi xoá công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTasks,
  createTask,
  updateStatusTask,
  updateTask,
  deleteTask,
};
