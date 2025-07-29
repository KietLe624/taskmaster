const db = require("../models/index.model");
const Task = db.Task;
const Project = db.Project;
const { Sequelize } = db;

/**
 * Lấy dữ liệu tổng quan cho trang báo cáo.
 * Bao gồm phân bổ trạng thái công việc và số lượng công việc theo dự án.
 */
const getOverviewReport = async (req, res) => {
    try {
        const currentUserId = req.user.user_id; // Lấy ID người dùng từ token đã xác thực
        const taskStatusDistribution = await Task.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('task_id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        const tasksPerProject = await Project.findAll({
            attributes: [
                'name',
                [Sequelize.fn('COUNT', Sequelize.col('tasks.task_id')), 'taskCount']
            ],
            include: [{
                model: Task,
                as: 'tasks', // Bí danh này phải khớp với định nghĩa trong model
                attributes: [] // Không cần lấy thuộc tính nào từ bảng Task ở đây
            }], where: {
                manager_id: currentUserId // Thêm điều kiện lọc
            },
            group: ['Project.id', 'Project.name'],
            raw: true
        });

        // --- 3. Trả về dữ liệu cho client ---
        res.status(200).json({
            taskStatusDistribution,
            tasksPerProject
        });

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu báo cáo:", error);
        res.status(500).json({ message: "Lỗi server khi xử lý yêu cầu báo cáo." });
    }
};

module.exports = {
    getOverviewReport,
};
