const db = require("../models/index.model");
const { Op } = require("sequelize");
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const sequelize = db.sequelize;

// Kiểm tra xem người dùng có phải là quản lý dự án hay không
const isProjectManager = async (userId, projectId) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    // Trả về false nếu không tìm thấy dự án
    return false;
  }
  return project.manager_id === userId;
};

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

    // Lấy ID các task được giao cho user
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

  const t = await sequelize.transaction(); // Bắt đầu một transaction

  try {
    const { name, description, status, priority, cate, due_date, project_id, start_time } =
      req.body;

    let assignee_ids = req.body.assignee_id; // Lấy ra để xử lý

    const requesterId = req.user.user_id; // Lấy ID người tạo task từ token

    // Kiểm tra dữ liệu đầu vào
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
    // Tạo công việc mới trong transaction
    const newTask = await Task.create(
      {
        name,
        description,
        status,
        priority,
        cate,
        start_time, // Thêm trường start_time với thời gian hiện tại
        due_date,
        project_id,
      },
      { transaction: t }
    );

    // SỬA LỖI: Chuẩn hóa assignee_id thành một mảng để xử lý nhất quán
    if (assignee_ids && !Array.isArray(assignee_ids)) {
      assignee_ids = [assignee_ids]; // Nếu là một số, biến nó thành mảng một phần tử
    }

    // Nếu có người được giao việc
    if (assignee_ids && assignee_ids.length > 0) {
      console.log("[DEBUG] Đã đi vào khối xử lý giao việc và thông báo.");

      // Gán công việc cho các thành viên
      await newTask.setAssignees(assignee_ids, { transaction: t });

      // --- TÍCH HỢP LOGIC THÔNG BÁO ---
      // 1. Lấy thông tin cần thiết cho nội dung thông báo
      const { createNotification } = require("./notifications.controller"); // Just-in-time require
      const project = await Project.findByPk(project_id, { transaction: t });
      const requester = await User.findByPk(requesterId, { transaction: t });

      // Kiểm tra xem có lấy được thông tin dự án và người yêu cầu không
      if (!project || !requester) {
        console.error(
          "[DEBUG] LỖI: Không tìm thấy Project hoặc Requester. Sẽ rollback."
        );
        await t.rollback();
        return res.status(404).json({
          message: "Không tìm thấy dự án hoặc thông tin người giao việc.",
        });
      }
      console.log(
        `[DEBUG] Thông tin để tạo message: Project Name='${project.name}', Requester Name='${requester.full_name}'`
      );

      // 2. Lặp qua từng người được giao để tạo thông báo
      for (const singleAssigneeId of assignee_ids) {
        console.log(
          `[DEBUG] Vòng lặp: Chuẩn bị tạo thông báo cho user ID: ${singleAssigneeId}`
        );

        // Đảm bảo không tự gửi thông báo cho chính mình
        if (singleAssigneeId !== requesterId) {
          await createNotification(
            {
              user_id: singleAssigneeId,
              type: "NEW_TASK",
              message: `${requester.full_name} vừa giao cho bạn một công việc mới: "${newTask.name}" trong dự án "${project.name}".`,
              link: `/app/projects/${project.id}/tasks/${newTask.task_id}`,
            },
            { transaction: t }
          ); // Thêm transaction vào hàm tạo thông báo
          console.log(
            `[DEBUG] ĐÃ GỌI createNotification cho user ID: ${singleAssigneeId}`
          );
        }
      }
    } else {
      console.log(
        "[DEBUG] Không có assignee_id hoặc không phải mảng, bỏ qua khối thông báo."
      );
    }

    // Nếu tất cả thành công, commit transaction
    await t.commit();

    // Lấy lại thông tin task đầy đủ để trả về cho client
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
    // Nếu có bất kỳ lỗi nào, rollback tất cả các thay đổi
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Lỗi khi tạo công việc:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
// cập nhật trạng thái công việc
const updateStatusTask = async (req, res) => {
  try {
    const taskId = req.params.id; // Lấy taskId từ URL
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
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};

// Cập nhật thông tin công việc
const updateTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id; // Lấy taskId từ URL
    const requesterId = req.user.user_id; // Lấy ID người yêu cầu từ token

    const {
      name,
      description,
      priority,
      cate,
      start_time, // Thêm trường start_time
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

    // Tìm công việc trước khi kiểm tra quyền
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    // Kiểm tra quyền hạn AFTER finding the task
    const canUpdate = await isProjectManager(requesterId, task.project_id);
    if (!canUpdate) {
      await t.rollback();
      return res.status(403).json({
        message: "Chỉ người quản lý dự án mới có quyền sửa công việc.",
      });
    }

    // Cập nhật các trường thông tin
    await task.update(
      {
        name,
        description,
        priority,
        cate,
        start_time, // Cập nhật trường start_time
        due_date,
        project_id,
        status,
      },
      { transaction: t }
    );

    // Cập nhật người thực hiện
    if (assignee_id) {
      await task.setAssignees([assignee_id], { transaction: t });
    }

    await t.commit();

    // Trả về kết quả
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
// xoá công việc
const deleteTask = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    // THÊM DÒNG NÀY: Lấy ID người dùng từ token đã được xác thực
    const requesterId = req.user.user_id;

    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    // Bây giờ requesterId đã có giá trị
    const canDelete = await isProjectManager(requesterId, task.project_id);
    if (!canDelete) {
      // THÊM DÒNG NÀY: Rollback transaction trước khi trả về lỗi
      await t.rollback();
      return res.status(403).json({
        message: "Chỉ người quản lý dự án mới có quyền xóa công việc.",
      });
    }

    // Xóa các bản ghi liên quan trong bảng TaskAssignments
    await task.setAssignees([], { transaction: t });

    // Xóa công việc
    await task.destroy({ transaction: t });

    // Commit nếu mọi thứ thành công
    await t.commit();

    res.status(200).json({
      message: `Công việc #${taskId} và các phân công liên quan đã được xoá.`,
    });
  } catch (error) {
    // Đảm bảo rollback nếu có lỗi xảy ra
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Lỗi khi xóa công việc:", error); // Log lỗi chi tiết ở backend
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
