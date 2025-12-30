import { Router } from "express";
import { tmauthControl, tmhandleCallback } from "../../controllers/taskmaster/auth.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkTMstatus from "../../middleware/checkTMstatus.middleware.js";
import { acceptJob, getAvailableJobs, getCompleted, getInProgressJobs, verifyJobOtp } from "../../controllers/taskmaster/jobs.controller.js";

const TaskMasterJobs = Router();

TaskMasterJobs.post("/getJobsAvailable",protectedMiddleware,checkTMstatus,getAvailableJobs);
TaskMasterJobs.post("/getJobsInProgress",protectedMiddleware,getInProgressJobs);
TaskMasterJobs.post("/getJobsCompleted",protectedMiddleware,getCompleted);

TaskMasterJobs.post("/acceptJob",protectedMiddleware,checkTMstatus,acceptJob)
TaskMasterJobs.post("/verifyJobComplete", protectedMiddleware, verifyJobOtp);

export default TaskMasterJobs;