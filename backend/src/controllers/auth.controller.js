const db = require("../models/index.model"); // Import file index trung tâm
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// func register
const register = async (req, res) => {
  const { User } = db; // Import model User từ index.model
  try {
    const { username, email, password, full_name } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Người dùng đã tồn tại" });
    }
    // kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); // Sử dụng bcrypt để mã hóa mật khẩu

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name,
    });
    // Trả về thông tin người dùng mới
    res.status(201).json({
      message: "Đăng ký thành công",
      id: newUser.id,
    });
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi đăng ký", error: error.message });
  }
};

// func login
const login = async (req, res) => {
  const { User } = db; // Import model User từ index.model
  const { Op } = require("sequelize"); // Import Op từ sequelize để sử dụng trong truy vấn
  try {
    const { login, password } = req.body;
     console.log(`[AUTH DEBUG] Đang thử đăng nhập cho: ${login}`);
    // Tìm người dùng theo email hoặc tên đăng nhập
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: login }, { username: login }],
      },
    });
    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      console.log(`[AUTH DEBUG] Không tìm thấy người dùng.`);
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    console.log(`[AUTH DEBUG] Đã tìm thấy người dùng: ${user.email}`); // LOG 3
    console.log(`[AUTH DEBUG] Mật khẩu đã mã hóa trong DB: ${user.password}`); // LOG 4
    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DEBUG] Kết quả so sánh mật khẩu: ${isPasswordValid}`); // LOG 5
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }
    // Thời gian hết hạn của token
    const options = {
      expiresIn: "1h", // Token hết hạn sau 30p
      algorithm: "HS256", // Thuật toán mã hóa (mặc định)
    };
    // Tạo token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, options);
    // Trả về thông tin người dùng và token
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};
module.exports = {
  register,
  login,
};
