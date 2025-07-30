const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

/* --------------------------------------------Controllers--------------------------------------------- */
// UserController
const {
  getAllUsers,
  getUserInfo,
  getManagedProjectCount,
  updateUser,
} = require("../controllers/users.controller");

// ProjectController
const {
  getAllProjects,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
} = require("../controllers/projects.controller");

// DashboardController
const { getDashboardData } = require("../controllers/dashboard.controller");

// AuthController
const {
  register,
  login,
  changePassword,
} = require("../controllers/auth.controller");

// TaskController
const {
  getTasks,
  createTask,
  updateStatusTask,
  updateTask,
  deleteTask,
  getNotificationsForTask,
  getTasksInMonth,
} = require("../controllers/tasks.controller");

// NotificationController
const {
  createNotification,
  getUserNotifications,
  markAsRead,
} = require("../controllers/notifications.controller");
// ReportController
const { getOverviewReport } = require("../controllers/report.controller");

/* 
-------------------------------------Middleware--------------------------------------
*/
const { authenticateToken } = require("../middleware/auth.middleware");

router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));

// Dashboard Routes
router.get("/", authenticateToken, getDashboardData); // Get dashboard data
router.get("/dashboard", authenticateToken, getDashboardData); // Get dashboard data

// User Routes
router.get("/users/all", getAllUsers); // Get all users
router.get("/users/:user_id", authenticateToken, getUserInfo); // Get user by ID
router.get("/users/:id/countManagedProjects", getManagedProjectCount); // Count managed projects
router.put("/users/:id", authenticateToken, updateUser); // Update user info

// Project Routes
router.get("/projects/all", getAllProjects); // Get all projects
router.get("/projects", authenticateToken, getProjects); // Get user projects
router.get("/projects/:id", authenticateToken, getProjectById); // Get project by ID
router.post("/projects", authenticateToken, createProject); // Create new project
router.put("/projects/:id", authenticateToken, updateProject); // Update project
router.delete("/projects/:id", authenticateToken, deleteProject); // Delete project
router.post("/projects/:id/members", authenticateToken, addMemberToProject); // Add member to project

// Authentication Routes
router.post("/auth/register", register); // User registration
router.post("/auth/signin", login); // User login
router.patch("/auth/changePassword", authenticateToken, changePassword); // Update user password

// Task Routes
router.get("/tasks", authenticateToken, getTasks); // Get tasks
router.post("/tasks", authenticateToken, createTask); // Create new task
router.patch("/tasks/taskStatus/:id", authenticateToken, updateStatusTask); // Update task status
router.put("/tasks/:id", authenticateToken, updateTask); // Update task
router.delete("/tasks/:id", authenticateToken, deleteTask); // Delete task
router.get("/tasks/activity/:year/:month", authenticateToken, getTasksInMonth); // Get tasks in month
router.get("/tasks/:id/notifications", authenticateToken, getNotificationsForTask); // Get notifications for task

// Notification Routes
router.post("/notifications", authenticateToken, createNotification); // Create notification
router.get("/notifications", authenticateToken, getUserNotifications); // Get user notifications
router.patch("/notifications/:id", authenticateToken, markAsRead); // Mark notification as read

// Report Routes
router.get("/reports/overview", authenticateToken, getOverviewReport);

module.exports = router;
