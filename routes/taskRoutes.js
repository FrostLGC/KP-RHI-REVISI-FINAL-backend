const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const roleVerification = require("../middlewares/roleVerification");
const {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
} = require("../controllers/taskControllers");

const router = express.Router();
const {
  getUsersWithTasksGrouped,
} = require("../controllers/userTasksController");

// project routes
router.get(
  "/dashboard-data",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  getDashboardData
);
router.get(
  "/user-dashboard-data",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  getUserDashboardData
);
router.get(
  "/",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  getTasks
);
router.get(
  "/:id",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  getTaskById
);
router.get(
  "/users/tasks-grouped",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  getUsersWithTasksGrouped
);
router.post(
  "/",
  protect,
  roleVerification.allowRoles(["superadmin", "admin"]),
  roleVerification.validateHighPriorityAssignment,
  createTask
); //create task (admin and superadmin only)
router.put(
  "/:id",
  protect,
  roleVerification.allowRoles(["superadmin", "admin"]),
  roleVerification.adminManageAssignedUsers,
  updateTask
); //update task (admin and superadmin only)
router.delete(
  "/:id",
  protect,
  roleVerification.allowRoles(["superadmin", "admin"]),
  deleteTask
); //delete task (admin and superadmin only)
router.put(
  "/:id/status",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  updateTaskStatus
); //update task status
router.put(
  "/:id/todo",
  protect,
  roleVerification.allowRoles(["superadmin", "admin", "hrd", "user"]),
  roleVerification.adminManageAssignedUsers,
  updateTaskChecklist
); //update task checklist

module.exports = router;
