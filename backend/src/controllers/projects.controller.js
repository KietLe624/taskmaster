const { TokenExpiredError } = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const ProjectMember = db.ProjectMember;

console.log("Các models đã được nạp:", Object.keys(db));

const getProjects = async (req, res) => {
  try {
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Bạn cần đăng nhập để truy cập dữ liệu dự án." });
    }

    // Lấy tất cả dự án và bao gồm các model liên quan.
    // Cách tiếp cận này không dùng GROUP BY trong SQL để tránh lỗi only_full_group_by.
    const projects = await Project.findAll({
      where: { manager_id: currentUserId },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["full_name"],
        },
        {
          model: Task,
          as: "tasks", // Quan hệ để tính tiến độ
          attributes: ["status"],
        },
        {
          model: ProjectMember,
          as: "members", // Quan hệ để đếm thành viên
          attributes: ["id"], // Chỉ cần lấy id để đếm
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp dự án mới nhất lên đầu
    });

    // Xử lý dữ liệu trong JavaScript để thêm trường 'progress' và 'countMember'
    const projectsWithDetails = projects.map((project) => {
      const plainProject = project.get({ plain: true });

      // Đếm số lượng thành viên
      plainProject.countMember = plainProject.members?.length || 0;

      // Tính toán tiến độ
      const totalTasks = plainProject.tasks?.length || 0;
      if (totalTasks === 0) {
        plainProject.progress = 0;
      } else {
        const completedTasks = plainProject.tasks.filter(
          (task) =>
            task.status &&
            (task.status.toLowerCase() === "completed" ||
              task.status.toLowerCase() === "hoàn thành")
        ).length;
        plainProject.progress = Math.round((completedTasks / totalTasks) * 100);
      }

      // Xóa các mảng không cần thiết khỏi đối tượng trả về để giữ response gọn nhẹ
      delete plainProject.tasks;
      delete plainProject.members;

      return plainProject;
    });

    return res.status(200).json({
      message: "Lấy danh sách dự án thành công",
      data: projectsWithDetails,
    });
  } catch (error) {
    console.error("[GET PROJECTS ERROR]", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const currentUserId = req.user?.user_id;

    if (!projectId) {
      return res.status(400).json({ message: "Thiếu ID dự án." });
    }
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["full_name", "email"],
        },
        {
          model: ProjectMember,
          as: "members",
          attributes: ["id", "user_id"],
          include: [
            {
              model: User,
              as: "users",
              attributes: ["full_name", "email"],
            },
          ],
        },
        {
          model: Task,
          as: "tasks",
          attributes: ["task_id", "name", "status", "priority", "due_date"],
          include: [
            {
              model: User,
              as: "assignees",
              attributes: ["user_id", "full_name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án." });
    }

    // Chuyển sang object thuần để thêm các thuộc tính tính toán
    const plainProject = project.get({ plain: true });

    // Tính toán tiến độ
    const totalTasks = plainProject.tasks?.length || 0;
    let completedTasks = 0;

    if (totalTasks > 0) {
      completedTasks = plainProject.tasks.filter(
        (task) =>
          task.status &&
          (task.status.toLowerCase() === "completed" ||
            task.status.toLowerCase() === "hoàn thành")
      ).length;
      plainProject.progress = Math.round((completedTasks / totalTasks) * 100);
    } else {
      plainProject.progress = 0;
    }

    plainProject.completedTasksCount = completedTasks;
    plainProject.totalTasksCount = totalTasks;

    return res.status(200).json(plainProject);
  } catch (error) {
    console.error("[GET PROJECT BY ID ERROR]", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy dự án", error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const { name, description, start_date, end_date, progress } = req.body;

    if (!name || !start_date) {
      return res.status(400).json({
        message: "Tên dự án và ngày bắt đầu không được để trống!",
      });
    }

    const newProject = await Project.create({
      name,
      description,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null,
      progress: progress || 0,
      manager_id: currentUserId,
    });

    console.log("[CREATE PROJECT DEBUG] Dự án mới:", newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error("[CREATE PROJECT ERROR]", error.stack);
    res
      .status(500)
      .json({ message: "Tạo dự án không thành công", error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id; // SỬA: Lấy ID từ URL params
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án." });
    }

    if (project.manager_id !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa dự án này." });
    }

    // SỬA: Dùng req.body trực tiếp vì frontend đã gửi đúng định dạng
    const updatedProject = await project.update(req.body);

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("[UPDATE PROJECT ERROR]", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật dự án", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    console.log("[DELETE PROJECT DEBUG] Request params:", req.params); // Thêm log để debug
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ message: "Thiếu ID dự án." });
    }

    const project = await Project.findOne({
      where: { id: projectId, manager_id: currentUserId },
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: "Dự án không tồn tại hoặc không có quyền xóa." });
    }

    await project.destroy();
    console.log("[DELETE PROJECT DEBUG] Dự án đã xóa:", projectId);
    res.status(200).json({ message: "Dự án đã được xóa thành công." });
  } catch (error) {
    console.error("[PROJECTS ERROR] Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa dự án", error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
