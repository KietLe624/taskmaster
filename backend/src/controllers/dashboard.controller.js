const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User; // Lấy model User từ đối tượng db
const Project = db.Project; // Lấy model Projects từ đối tượng db

// LOG GỠ LỖI: In ra tất cả các key (tên model) có trong đối tượng db
console.log("Các models đã được nạp:", Object.keys(db));

const getAllProjectsDashBoard = async (req, res) => {
  try {
    // Thêm một bước kiểm tra để đảm bảo model Project tồn tại trước khi sử dụng
    if (!Project || !User) {
      return res.status(500).json({
        message: "Lỗi server: Model Project chưa được khởi tạo.",
        troubleshooting:
          "Hãy kiểm tra xem file project.model.js có tồn tại trong thư mục models và có cấu trúc đúng không.",
      });
    }

    const projects = await Project.findAll({
      // Thêm 'include' để lấy cả thông tin của người quản lý từ bảng users
      include: [
        {
          model: User,
          as: "manager", // 'manager' là bí danh bạn đã định nghĩa trong project.model.js
          attributes: ["id", "full_name", "email"], // Chỉ lấy các trường cần thiết của user
        },
      ],
    });
    res.status(200).json(projects);
  } catch (error) {
    // Nếu có lỗi ở đây, hãy xem kỹ log trong terminal để biết chi tiết
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
  }
};

const countProjectsDashboard = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy ID của user từ URL
    const count = await Project.count({
      where: {
        manager_id: userId,
      },
    });
    res.status(200).json({ count: count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đếm số dự án", error: error.message });
  }
};

// Hàm chính để lấy tất cả dữ liệu cho Dashboard
const getDashboardData = async (req, res) => {
  try {
    // Thực hiện các truy vấn thống kê song song để tăng hiệu suất
    const [projectCount, userCount, recentProjects, dueTasks] =
      await Promise.all([
        Project.count(),
        User.count(),
        Project.findAll({
          limit: 5, // Giới hạn số lượng dự án gần đây
          order: [["updated_at", "DESC"]],
          include: [{ model: User, as: "manager", attributes: ["full_name"] }],
          raw: true,
          nest: true
        }),
      ]);

    // Trả về dữ liệu tổng hợp
    res.status(200).json({
      stats: {
        totalProjects: projectCount,
      },
      recentProjects,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy dữ liệu dashboard", error: error.message });
  }
};

module.exports = {
  countProjectsDashboard,
  getAllProjectsDashBoard,
  getDashboardData,
};
