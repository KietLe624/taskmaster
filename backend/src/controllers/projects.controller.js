const { TokenExpiredError } = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const ProjectMember = db.ProjectMember;


console.log("Các models đã được nạp:", Object.keys(db));

const getProjects = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Bạn cần đăng nhập để truy cập dữ liệu dự án." });
    }

    if (!Project || !User || !ProjectMember) {
      return res.status(500).json({
        message:
          "Lỗi server: Model Project, User hoặc ProjectMember chưa được khởi tạo.",
        troubleshooting:
          "Kiểm tra lại file index.model.js, project.model.js, user.model.js và projectmember.model.js.",
      });
    }

    const projects = await Project.findAll({
      where: { manager_id: currentUserId },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["full_name", "email"],
          required: true,
        },
        {
          model: ProjectMember,
          as: "members",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn("COUNT", db.sequelize.col("members.id")),
            "countMember",
          ],
        ],
      },
      group: ["Project.id", "manager.id", "members.project_id"],
    });

    console.log("[PROJECTS DEBUG] Dự án:", projects);
    return res.status(200).json(projects);
  } catch (error) {
    console.error("[PROJECTS ERROR] Stack trace:", error.stack);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ message: "Thiếu ID dự án." });
    }

    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }

    const project = await Project.findOne({
      where: { id: projectId, manager_id: currentUserId },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["full_name", "email"],
        },
        {
          model: ProjectMember,
          as: "members",
          attributes: ["user_id"],
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
          attributes: ["id", "name", "description", "due_date", "status", "priority"],
          include: [
            {
              model: User,
              as: "assignees",
              attributes: ["id", "full_name", "email"],
              // Thêm lại fix để tránh lỗi "Unknown column" trên bảng trung gian TaskAssignments
              through: {
                attributes: []
              },
            },
          ],
        }
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án." });
    }

    console.log("[GET PROJECT BY ID DEBUG] Dự án:", project);
    return res.status(200).json(project);
  } catch (error) {
    console.error("[GET PROJECT BY ID ERROR]", error);
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn." });
    }
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
