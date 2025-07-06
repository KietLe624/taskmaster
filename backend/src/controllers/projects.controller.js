const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User; // Lấy model User từ đối tượng db
const Project = db.Project; // Lấy model Projects từ đối tượng db

// LOG GỠ LỖI: In ra tất cả các key (tên model) có trong đối tượng db
console.log("Các models đã được nạp:", Object.keys(db));

const getAllProjects = async (req, res) => {
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

const countProjects = async (req, res) => {
  try {
    const Project = db.Project;
    const User = db.User;
    // Thêm một bước kiểm tra để đảm bảo model Project tồn tại trước khi sử dụng
    if (!Project) {
      return res.status(500).json({
        message: "Lỗi server: Model Project chưa được khởi tạo.",
        troubleshooting:
          "Hãy kiểm tra xem file project.model.js có tồn tại trong thư mục models và có cấu trúc đúng không.",
      });
    }
    if (!User) {
      return res.status(500).json({
        message: "Lỗi server: Model User chưa được khởi tạo.",
        troubleshooting:
          "Hãy kiểm tra xem file user.model.js có tồn tại trong thư mục models và có cấu trúc đúng không.",
      });
    }
    // Sử dụng Sequelize để đếm số lượng dự án
    const projectCount = await db.Project.count();
    res.status(200).json({ count: projectCount });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đếm số lượng dự án",
      error: error.message,
    });
  }
};

module.exports = {
  countProjects,
  getAllProjects,
};
