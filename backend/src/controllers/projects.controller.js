const { TokenExpiredError } = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const ProjectMember = db.ProjectMember;

console.log("Các models đã được nạp:", Object.keys(db));

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("[GET ALL PROJECTS ERROR]", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách dự án",
      error: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const currentUserId = req.user?.user_id;
    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Bạn cần đăng nhập để truy cập dữ liệu dự án." });
    }

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
          as: "tasks",
          attributes: ["status"],
        },
        {
          model: ProjectMember,
          as: "members",
          attributes: ["id"], // Chỉ lấy thông tin thành viên, không cần thuộc tính cụ thể
          include: [
            {
              model: User,
              as: "users",
              attributes: ["user_id", "full_name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Xử lý dữ liệu để thêm 'progress' và định dạng lại 'members'
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

      // *** THAY ĐỔI 2: Xử lý lại mảng members thay vì xóa nó đi ***
      // Biến đổi mảng `members` để chỉ chứa thông tin `full_name` của user.
      if (plainProject.members) {
        plainProject.members = plainProject.members.map(
          (member) => member.users
        );
      } else {
        plainProject.members = []; // Đảm bảo members luôn là một mảng
      }

      // Xóa mảng tasks không cần thiết để giữ response gọn nhẹ
      delete plainProject.tasks;

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
              attributes: ["username", "full_name", "email"],
            },
          ],
        },
        {
          model: Task,
          as: "tasks",
          attributes: [
            "task_id",
            "name",
            "status",
            "cate",
            "priority",
            "due_date",
          ],
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
    const currentUserId = req.user?.user_id;
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
    const currentUserId = req.user?.user_id;
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
    const currentUserId = req.user?.user_id;
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
  getAllProjects,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
