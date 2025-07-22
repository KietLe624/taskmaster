const { Op } = require("sequelize");
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
      where: {
        [Op.or]: [
          // Điều kiện 1: Người dùng là người quản lý dự án
          { manager_id: currentUserId },
          // Điều kiện 2: Người dùng là thành viên của dự án (sử dụng subquery)
          {
            id: {
              [Op.in]: db.sequelize.literal(
                `(SELECT project_id FROM projectmembers WHERE user_id = ${currentUserId})`
              ),
            },
          },
        ],
      },
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
          attributes: ["id"],
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
      distinct: true, // Tránh trả về các dự án trùng lặp nếu người dùng vừa là manager vừa là member
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

const addMemberToProject = async (req, res) => {
  try {
    const projectId = req.params.id; // Lấy ID dự án từ URL
    const { email, role } = req.body; // Lấy email và vai trò từ body
    const requesterId = req.user.user_id; // Lấy ID của người yêu cầu từ token

    if (!email || !role) {
      return res.status(400).json({
        message: "Vui lòng cung cấp email và vai trò của thành viên.",
      });
    }

    // 1. Tìm dự án và người dùng cần thêm
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án." });
    }

    const userToAdd = await User.findOne({ where: { email: email } });
    if (!userToAdd) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy người dùng với email: ${email}` });
    }

    // 2. Kiểm tra quyền hạn: Chỉ người quản lý dự án mới có quyền thêm
    if (project.manager_id !== requesterId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thêm thành viên vào dự án này." });
    }

    // 3. Kiểm tra xem người dùng đã là thành viên chưa bằng cách truy vấn bảng ProjectMember
    const existingMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userToAdd.user_id,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Người dùng này đã là thành viên của dự án." });
    }

    // 4. Thêm người dùng vào dự án bằng cách tạo một bản ghi mới trong ProjectMember
    const { createNotification } = require("./notifications.controller");
    await ProjectMember.create({
      project_id: projectId,
      user_id: userToAdd.user_id,
      role: role, // 'member', 'admin', etc.
      added_at: new Date(),
    });

    // 5. Tích hợp tạo thông báo
    const requester = await User.findByPk(requesterId); // Lấy thông tin người mời
    if (!requester) {
      return res.status(404).json({ message: "Không tìm thấy người mời." });
    }
    console.log(
      `[ADD MEMBER DEBUG] Người mời: ${requester.full_name} (${requester.email})`
    );
    // Tạo thông báo cho người dùng mới được thêm vào
    await createNotification({
      user_id: userToAdd.user_id,
      type: "Thêm thành viên dự án",
      message: `Bạn vừa được ${requester.full_name} thêm vào dự án "${project.name}" với vai trò ${role}.`,
      link: `/app/projects/${project.id}`, // Link để điều hướng khi click
    });

    res.status(200).json({ message: "Thêm thành viên thành công." });
  } catch (error) {
    console.error("Lỗi khi thêm thành viên:", error);
    res.status(500).send({
      message: "Lỗi khi thêm thành viên vào dự án",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProjects,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
};
