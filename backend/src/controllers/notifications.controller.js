const db = require("../models/index.model"); // Import file index trung tâm
const Notification = db.Notification;

// tạo thông báo mới
const createNotification = async (data) => {
  try {
    await Notification.create(data);
    console.log(`Đã tạo thông báo cho user_id: ${data.user_id}`);
    // (Nâng cao) Tại đây, bạn có thể phát một sự kiện WebSocket đến người dùng 
  } catch (error) {
    console.error("Lỗi khi tạo thông báo:", error);
  }
};

const getUserNotifications = async (req, res) => {
  const userId = req.user.user_id; // Lấy từ middleware xác thực token

  try {
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]], // Sắp xếp mới nhất lên đầu
      limit: 50, // Giới hạn số lượng thông báo trả về
    });
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi lấy thông báo", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  const userId = req.user.user_id;
  const notificationId = req.params.id; // Lấy id từ URL, vd: /api/notifications/123/read

  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId, // Đảm bảo người dùng chỉ có thể đánh dấu thông báo của chính họ
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }

    notification.status_read = true;
    await notification.save();

    res.status(200).json({ message: "Đã đánh dấu là đã đọc." });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi đánh dấu thông báo", error: error.message });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};
