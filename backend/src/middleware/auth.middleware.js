const jwt = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;

// Thay 'YOUR_SECRET_KEY' bằng một chuỗi bí mật của riêng bạn
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  // Lấy token từ header 'Authorization: Bearer TOKEN'
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Token không được cung cấp." }); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, async (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ." }); // Forbidden
    }

    // Token hợp lệ, gắn thông tin payload vào request
    // Payload khi tạo token nên chứa id, ví dụ: { id: userId, username: username }
    const user = await User.findByPk(userPayload.user_id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    req.user = user.toJSON(); // Gắn toàn bộ thông tin user vào req
    next(); // Chuyển sang middleware/controller tiếp theo
  });
};
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).send({ message: "Không tìm thấy người dùng." });
    }

    const roles = await user.getRoles(); // Lấy danh sách các vai trò của user
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next(); // Nếu có vai trò 'admin', cho phép đi tiếp
        return;
      }
    }

    // Nếu không tìm thấy vai trò 'admin' trong vòng lặp
    return res.status(403).send({ message: "Yêu cầu quyền Admin!" });
  } catch (error) {
    return res.status(500).send({ message: "Không thể xác thực quyền Admin." });
  }
};
module.exports = { authenticateToken, isAdmin };
