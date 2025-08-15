# Taskmaster – Fullstack Application

Taskmaster là ứng dụng quản lý công việc fullstack gồm **Frontend** (Angular 20 + SSR) và **Backend** (Node.js + Express + MySQL). Ứng dụng hỗ trợ hiển thị biểu đồ với Chart.js, sử dụng TailwindCSS cho UI và JWT để xác thực.

---

## 📋 Yêu cầu hệ thống

Trước khi cài đặt, đảm bảo máy bạn đã có:

* **Node.js**: >= 20.x
* **npm**: >= 10.x
* **MySQL Server**: >= 8.x
* **Git** (nếu clone từ repo)
* Trình duyệt hiện đại (Chrome, Edge, Firefox...)

---

## 🚀 Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd taskmaster
```

### 2. Cài đặt dependencies cho Frontend

```bash
cd frontend
npm install
```

### 3. Cài đặt dependencies cho Backend

```bash
cd ../backend
npm install
```

### 4. Cấu hình biến môi trường cho Backend

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=taskmaster
JWT_SECRET=your_jwt_secret
```

> **Lưu ý**: Thay đổi giá trị `DB_USER`, `DB_PASSWORD` và `JWT_SECRET` cho phù hợp.

### 5. Khởi tạo cơ sở dữ liệu

Mở MySQL và tạo database:

```sql
CREATE DATABASE taskmaster;
```

Khi backend khởi chạy lần đầu, Sequelize sẽ tự tạo bảng dựa trên model.

---

## 📦 Các lệnh npm

### Frontend

* **Chạy development mode**:

```bash
npm start
```

* **Build production**:

```bash
npm run build
```

* **Chạy SSR (Server-Side Rendering)**:

```bash
npm run serve:ssr:taskmaster
```

### Backend

* **Chạy server**:

```bash
npm start
```

Server mặc định chạy ở: [http://localhost:5000](http://localhost:5000)

---

## ⚙️ Công nghệ sử dụng

### Frontend

* **Angular 20** – Frontend chính
* **TailwindCSS 2.2** – CSS utility-first
* **Chart.js 4.5** – Vẽ biểu đồ
* **RxJS** – Reactive programming
* **Angular SSR** – Render server

### Backend

* **Express 5** – Web framework
* **MySQL2** – Driver MySQL
* **Sequelize** – ORM
* **bcryptjs** – Mã hóa mật khẩu
* **jsonwebtoken** – Xác thực
* **dotenv** – Quản lý biến môi trường
* **cors** – Cross-Origin Resource Sharing
* **node-cron** – Chạy tác vụ định kỳ

---

## 📁 Cấu trúc thư mục gợi ý

```
taskmaster/
 ├── frontend/               # Angular SSR App
 │    ├── src/
 │    ├── dist/taskmaster/
 │    ├── tailwind.config.js
 │    └── package.json
 ├── backend/                # Node.js API
 │    ├── config/
 │    ├── controllers/
 │    ├── models/
 │    ├── routes/
 │    ├── middlewares/
 │    ├── server.js
 │    └── package.json
 └── README.md
```

---

## 🔒 Bảo mật

* Mật khẩu được mã hóa bằng **bcrypt**
* API xác thực qua **JWT**
* Cấu hình **CORS** để bảo vệ kết nối từ frontend

---

## 🛠 Phát triển & Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng ...'`)
4. Push branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request
