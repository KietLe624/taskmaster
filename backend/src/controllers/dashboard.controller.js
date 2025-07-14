const db = require("../models/index.model");
const User = db.User;
const Project = db.Project;
const Task = db.Task;
const TaskAssignment = db.TaskAssignment;

// Hàm chính để lấy tất cả dữ liệu cho Dashboard
const getDashboardData = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const currentUserId = req.user?.user_id; // Lấy ID của người dùng hiện tại từ token
    console.log("[DASHBOARD DEBUG] currentUserId:", currentUserId); // In ra ID người dùng

    if (!req.user || !req.user.user_id) {
      console.error(
        "[DASHBOARD DEBUG] LỖI: Người dùng chưa đăng nhập hoặc không có ID người dùng."
      );
      return res
        .status(401)
        .json({ message: "Bạn cần đăng nhập để truy cập dữ liệu Dashboard." });
    }

    // Kiểm tra xem các model cần thiết có tồn tại không
    if (!User || !Project || !Task) {
      console.error(
        "[DASHBOARD DEBUG] LỖI: Một hoặc nhiều model (User, Project, Task) không được khởi tạo trong db object."
      );
      return res
        .status(500)
        .json({ message: "Lỗi server: Model chưa được khởi tạo đúng cách." });
    }

    const [
      manageProjectsCount,
      manageTasksCount, // Sửa logic
      inProgressTasksCount, // Sửa logic
      dueSoonTasksCount, // Sửa logic
      completedTasksCount, // Sửa logic
      overdueTasksCount, // Sửa logic
      completedThisWeekCount, // Sửa logic
      currentUser,
      recentProjects,
    ] = await Promise.all([
      // Đếm số dự án do người dùng quản lý -> Đã sửa đúng tên cột
      Project.count({
        where: { manager_id: currentUserId },
      }),

      // Đếm tổng số nhiệm vụ được giao cho người dùng -> Đếm trên bảng taskassignments
      TaskAssignment.count({
        as: "assignments", // THÊM DÒNG NÀY
        where: { user_id: currentUserId },
      }),

      // Đếm các nhiệm vụ đang tiến hành -> Cần JOIN hai bảng
      Task.count({
        include: [
          {
            model: TaskAssignment,
            as: "assignments", // THÊM DÒNG NÀY
            where: { user_id: currentUserId },
            required: true, // Bắt buộc phải có trong bảng assignments (INNER JOIN)
          },
        ],
        where: { status: "in_progress" },
      }),

      // Đếm các nhiệm vụ sắp đến hạn
      Task.count({
        include: [
          {
            model: TaskAssignment,
            as: "assignments", // THÊM DÒNG NÀY
            where: { user_id: currentUserId },
            required: true,
          },
        ],
        where: { status: "due_soon" },
      }),

      // Đếm các nhiệm vụ đã hoàn thành
      Task.count({
        include: [
          {
            model: TaskAssignment,
            as: "assignments", // THÊM DÒNG NÀY
            where: { user_id: currentUserId },
            required: true,
          },
        ],
        where: { status: "completed" },
      }),

      // Đếm các nhiệm vụ quá hạn
      Task.count({
        include: [
          {
            model: TaskAssignment,
            as: "assignments", // THÊM DÒNG NÀY
            where: { user_id: currentUserId },
            required: true,
          },
        ],
        where: { status: "overdue" },
      }),

      // Đếm các nhiệm vụ đã hoàn thành trong tuần
      Task.count({
        include: [
          {
            model: TaskAssignment,
            as: "assignments", // THÊM DÒNG NÀY
            where: { user_id: currentUserId },
            required: true,
          },
        ],
        where: {
          status: "completed",
          updatedAt: {
            [db.Sequelize.Op.gte]: db.Sequelize.literal(
              "DATE_SUB(NOW(), INTERVAL 7 DAY)"
            ),
          },
        },
      }),

      User.findByPk(currentUserId),

      // Lấy các dự án gần đây -> Đã sửa đúng tên cột
      Project.findAll({
        where: { manager_id: currentUserId },
        limit: 3,
        order: [["createdAt", "DESC"]],
      }),
      // Khởi tạo mảng để chứa các Promise
    ]);
    res.status(200).json({
      currentUser, // Thông tin người dùng hiện tại
      stats: {
        manageProjectsCount, // Số lượng dự án do người dùng quản lý
        manageTasksCount, // Số lượng nhiệm vụ được giao cho người dùng
        inProgressTasksCount, // Số lượng nhiệm vụ đang tiến hành
        dueSoonTasksCount, // Số lượng nhiệm vụ sắp đến hạn
        completedTasksCount, // Số lượng nhiệm vụ đã hoàn thành
        overdueTasksCount, // Số lượng nhiệm vụ quá hạn
        completedThisWeekCount, // Số lượng nhiệm vụ đã hoàn thành trong tuần này
        // avgTimePerTask: "2h 15m",
        // onTimeCompletionRate: "92%"
      },
      recentProjects, // Danh sách 3 dự án gần đây do người dùng quản lý
    });
  } catch (erorr) {
    console.error("Lỗi khi lấy dữ liệu Dashboard:", erorr); // In ra lỗi nếu có
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu Dashboard" }); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
};

module.exports = {
  getDashboardData,
};
