const db = require("../models/index.model");
const { Op } = require("sequelize");
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const Notification = db.Notification;
const sequelize = db.sequelize;
const { createNotification } = require("./notifications.controller");

// ... (Toàn bộ các hàm khác như getAllTasks, createTask, updateTask... được giữ nguyên)

const isProjectManager = async (userId, projectId) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    return false;
  }
  return project.manager_id === userId;
};

const getAllTasks = async (req, res) => {
  if (!Task) {
    return res.status(500).json({
      message: "Lỗi server: Model Task chưa được khởi tạo đúng cách.",
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

const getTasks = async (req, res) => {
  try {
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const { name, status, priority, sortBy, sortOrder } = req.query;

    const whereCondition = {};
    const orderCondition = [];

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    if (status && status !== "all") {
      whereCondition.status = status;
    }
    if (priority && priority !== "all") {
      whereCondition.priority = priority;
    }

    if (sortBy) {
      orderCondition.push([sortBy, sortOrder || "ASC"]);
    } else {
      orderCondition.push(["due_date", "ASC"]);
    }

    const assignments = await db.TaskAssignment.findAll({
      where: { user_id: currentUserId },
      attributes: ["task_id"],
    });
    const taskIds = assignments.map((a) => a.task_id);

    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }
    whereCondition.task_id = { [Op.in]: taskIds }; // Sửa: sử dụng `id` thay vì `task_id` cho bảng `tasks`

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
    res.status(500).json({
      message: "Lỗi khi lấy danh sách công việc của bạn",
      error: error.message,
    });
  }
};

const getTasksInMonth = async (req, res) => {
  try {
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const assignments = await db.TaskAssignment.findAll({
      where: { user_id: currentUserId },
      attributes: ["task_id"],
    });
    const taskIds = assignments.map((a) => a.task_id);

    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }

    const tasksInMonth = await Task.findAll({
      where: {
        task_id: { [Op.in]: taskIds }, // Sửa: sử dụng `id`
        due_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [
          sequelize.fn(
            "DISTINCT",
            sequelize.fn("DATE", sequelize.col("due_date"))
          ),
          "activityDate",
        ],
      ],
    });

    const activeDays = tasksInMonth.map((task) =>
      task.getDataValue("activityDate")
    );

    res.status(200).json(activeDays);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hoạt động của task:", error);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
  }
};

const createTask = async (req, res) => {
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
      start_time,
    } = req.body;

    let assignee_ids = req.body.assignee_id;
    const requesterId = req.user.user_id;

    if (!name || !status || !priority || !cate || !due_date || !project_id) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ các trường bắt buộc." });
    }
    const canCreate = await isProjectManager(requesterId, project_id);
    if (!canCreate) {
      return res.status(403).json({
        message: "Chỉ người quản lý dự án mới có quyền tạo công việc.",
      });
    }

    const newTask = await Task.create(
      {
        name,
        description,
        status,
        priority,
        cate,
        start_time,
        due_date,
        project_id,
      },
      { transaction: t }
    );

    if (assignee_ids && !Array.isArray(assignee_ids)) {
      assignee_ids = [assignee_ids];
    }

    if (assignee_ids && assignee_ids.length > 0) {
      await newTask.setAssignees(assignee_ids, { transaction: t });

      const project = await Project.findByPk(project_id, { transaction: t });
      const requester = await User.findByPk(requesterId, { transaction: t });

      if (!project || !requester) {
        await t.rollback();
        return res.status(404).json({
          message: "Không tìm thấy dự án hoặc thông tin người giao việc.",
        });
      }

      for (const singleAssigneeId of assignee_ids) {
        if (singleAssigneeId !== requesterId) {
          await createNotification(
            {
              user_id: singleAssigneeId,
              task_id: newTask.id,
              type: "NEW_TASK",
              message: `${requester.full_name} vừa giao cho bạn một công việc mới: "${newTask.name}" trong dự án "${project.name}".`,
              link: `/app/projects/${project.id}/tasks/${newTask.id}`,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    const result = await Task.findByPk(newTask.id, {
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
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Lỗi khi tạo công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

const updateStatusTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ message: "Trạng thái không được để trống" });
    }
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại" });
    }
    await task.update({ status });
    res.status(200).json({
      message: `Cập nhật trạng thái task ${taskId} thành ${status} thành công`,
      data: task,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

const updateTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    const requesterId = req.user.user_id;

    const {
      name,
      description,
      priority,
      cate,
      start_time,
      due_date,
      status,
      project_id,
      assignee_id,
    } = req.body;

    if (!name || !due_date || !project_id) {
      return res
        .status(400)
        .json({ message: "Tên, ngày hết hạn, và dự án là bắt buộc." });
    }

    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    const canUpdate = await isProjectManager(requesterId, task.project_id);
    if (!canUpdate) {
      await t.rollback();
      return res.status(403).json({
        message: "Chỉ người quản lý dự án mới có quyền sửa công việc.",
      });
    }

    await task.update(
      {
        name,
        description,
        priority,
        cate,
        start_time,
        due_date,
        project_id,
        status,
      },
      { transaction: t }
    );

    if (assignee_id) {
      await task.setAssignees([assignee_id], { transaction: t });
    }

    await t.commit();

    const updatedTask = await Task.findByPk(taskId, {
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

    res.status(200).json({
      message: `Cập nhật công việc #${taskId} thành công.`,
      data: updatedTask,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi cập nhật task:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    const requesterId = req.user.user_id;

    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    const canDelete = await isProjectManager(requesterId, task.project_id);
    if (!canDelete) {
      await t.rollback();
      return res.status(403).json({
        message: "Chỉ người quản lý dự án mới có quyền xóa công việc.",
      });
    }

    await task.setAssignees([], { transaction: t });
    await task.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({
      message: `Công việc #${taskId} và các phân công liên quan đã được xoá.`,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Lỗi khi xóa công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

const getNotificationsForTask = async (req, res) => {
  try {
    const taskId = req.params.id; // Lấy task_id từ URL
    const managerId = req.user.user_id; // Lấy từ token xác thực

    // --- BƯỚC GỠ LỖI 1: Ghi lại thông tin đầu vào ---
    console.log(`--- [DEBUG] Bắt đầu getNotificationsForTask ---`);
    console.log(`Task ID nhận được từ URL: ${taskId}`);
    console.log(`Manager ID (từ token): ${managerId}`);
    console.log(`-------------------------------------------`);

    if (!taskId) {
      return res.status(400).send({ message: "Thiếu task_id trong yêu cầu." });
    }

    // Bước 1: Kiểm tra quyền của người quản lý
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: "project" }],
    });

    if (!task) {
      console.log(`[DEBUG] Không tìm thấy công việc với ID: ${taskId}`);
      return res.status(404).send({ message: "Không tìm thấy công việc." });
    }

    // --- BƯỚC GỠ LỖI 2: Ghi lại kết quả kiểm tra quyền ---
    console.log(`[DEBUG] ID quản lý của dự án là: ${task.project.manager_id}`);
    console.log(
      `[DEBUG] So sánh quyền: ${task.project.manager_id} === ${managerId} ? ${
        task.project.manager_id === managerId
      }`
    );
    console.log(`-------------------------------------------`);

    if (task.project.manager_id !== managerId) {
      console.log(`[DEBUG] KIỂM TRA QUYỀN THẤT BẠI. Trả về lỗi 403.`);
      return res
        .status(403)
        .send({ message: "Bạn không có quyền xem thông tin này." });
    }

    // Bước 2: Lấy danh sách thông báo
    const notifications = await Notification.findAll({
      where: { task_id: taskId },
      include: [
        {
          model: User,
          as: "recipient", // SỬA LỖI: Đảm bảo bí danh này khớp với model 'notification.model.js'
          attributes: ["full_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // --- BƯỚC GỠ LỖI 3: Ghi lại kết quả truy vấn ---
    console.log(
      `[DEBUG] Đã tìm thấy ${notifications.length} thông báo cho task_id: ${taskId}.`
    );
    console.log(
      `[DEBUG] Dữ liệu thông báo trả về:`,
      JSON.stringify(notifications, null, 2)
    );
    console.log(`--- [DEBUG] Kết thúc getNotificationsForTask ---`);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử thông báo:", error);
    res.status(500).send({ message: "Lỗi server khi lấy lịch sử thông báo." });
  }
};

module.exports = {
  getAllTasks,
  getTasks,
  createTask,
  updateStatusTask,
  updateTask,
  deleteTask,
  getTasksInMonth,
  getNotificationsForTask,
};
