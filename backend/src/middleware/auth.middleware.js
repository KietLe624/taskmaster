const jwt = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;

// Thay 'YOUR_SECRET_KEY' bằng một chuỗi bí mật của riêng bạn
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  // Lấy token từ header 'Authorization: Bearer TOKEN'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: "Token không được cung cấp." }); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, async (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ." }); // Forbidden
    }

    // Token hợp lệ, gắn thông tin payload vào request
    // Payload khi tạo token nên chứa id, ví dụ: { id: userId, username: username }
    const user = await User.findByPk(userPayload.id);
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    
    req.user = user.toJSON(); // Gắn toàn bộ thông tin user vào req
    next(); // Chuyển sang middleware/controller tiếp theo
  });
};

module.exports = authenticateToken;