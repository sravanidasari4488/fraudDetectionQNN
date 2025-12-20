import express from "express";
import protectedMiddleware from "./middleware/protected.middleware.js";
import cors from "cors";
import helmet from "helmet";
import userRouter from "./routes/user.routes.js";
import cartRouter from "./routes/cart.routes.js";
import postRouter from "./routes/post.routes.js";
import avatarRouter from "./routes/user_avatar.routes.js";
import razorpayRouter from "./routes/razorpay.routes.js"
import authRouter from "./routes/auth.routes.js";
import deleteRouter from "./routes/delete.routes.js";
import taskMasterAuthRouter from "./routes/taskmaster/auth.routes.js";
import taskMasterProfileRouter from "./routes/taskmaster/profile.routes.js";
import adminAuthRouter from "./routes/admin/admin.auth.routes.js";
import deleteServiceRouter from "../src/routes/admin/admin.services.delete.routes.js";
import adminServiceEditRouter from "../src/routes/admin/admin.service.edit.routes.js";
import deleteAdminRouter from "./routes/admin/admin.delete.admin.routes.js";
import addAdminRouter from "./routes/admin/admin.add.admin.routes.js";
import adminCreateServiceRouter from "./routes/admin/admin.create.service.routes.js";
import adminDeleteUserRouter from "./routes/admin/admin.delete.user.routes.js";
import getBlockedUserRouter from "./routes/admin/admin.get.blocked.user.routes.js";
import adminUnblockUserRouter from "./routes/admin/admin.unblock.user.routes.js";
import adminEditServiceImageRouter from "./routes/admin/admin.edit.service.image.route.js";
import TaskMasterJobs from "./routes/taskmaster/Jobs.routes.js";
import getusersRouter from "./routes/admin/admin.getusers.routes.js";
import getServicesRouter from "./routes/admin/admin.getservices.routes.js";
import getAdminsRouter from "./routes/admin/admin.getadmins.routes.js";
import adminGetBookingsRouter from "./routes/admin/admkn.admingetbookings.routes.js";
import createTmRouter from "./routes/admin/admin.createtm.routes.js";
import getTransactionRouter from "./routes/admin/admin.transactions.get.routes.js";
import adminWithdrawnRouter from "./routes/admin/admin.withdrawn.routes.js";
import getTaskmastersRouter from "./routes/admin/admin.gettaskmasters.routes.js";
import gettransactions_tmRouter from "./routes/admin/admin.gettransactions_tm.routes.js";
import onBoardTmRouter from "./routes/admin/admin.onboardtm.routes.js";
import getTmApplyRequestRouter from "./routes/admin/admin.gettmapplyrequest.routes.js";
import acceptTmRouter from "./routes/admin/admin.accepttm.routes.js";
import rejecttmRouter from "./routes/admin/admin.rejecttm.routes.js";
import smallRouter from "./routes/admin/admin.transactionsmall.routes.js";
import adminBannersRouter from "./routes/admin/admin.banners.routes.js";
import adminUpdatetmppRouter from "./routes/admin/admin.updatetmpp.controller.js";
import cancelBookingRouter from "./routes/admin/admin.cancel.booking.routes.js";
import generalDataRouter from "./routes/admin/admin.general.data.routes.js";
import blockTmRouter from "./routes/admin/admin.blocktmroutes.js";
import availabilityRouter from "./routes/availability.routes.js";
import locationRouter from "./routes/location.routes.js";
import profileRouter from "./routes/profile.routes.js";
import paymentRouter from "./routes/payment.routes.js";


const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});

app.use('/api/v1', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1', postRouter);
app.use('/api/v1', avatarRouter);
app.use('/api/v1', razorpayRouter);
app.use('/api/v1', deleteRouter);
app.use("/api/v1", availabilityRouter);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminAuthRouter);
app.use("/api/v1/admin", deleteServiceRouter);
app.use("/api/v1/admin", adminServiceEditRouter);
app.use("/api/v1/admin", deleteAdminRouter);
app.use("/api/v1/admin", addAdminRouter)
app.use("/api/v1/admin", adminCreateServiceRouter);
app.use("/api/v1/admin", adminDeleteUserRouter);
app.use("/api/v1/admin", getBlockedUserRouter);
app.use("/api/v1/admin", adminUnblockUserRouter);
app.use("/api/v1/admin", adminEditServiceImageRouter);
app.use("/api/v1/admin", getusersRouter);
app.use("/api/v1/admin", getServicesRouter);
app.use("/api/v1/admin", getAdminsRouter);
app.use("/api/v1/admin", adminGetBookingsRouter);
app.use("/api/v1/admin", createTmRouter);
app.use("/api/v1/admin", getTransactionRouter);
app.use("/api/v1/admin", adminWithdrawnRouter);
app.use("/api/v1/admin", getTaskmastersRouter);
app.use("/api/v1/admin", gettransactions_tmRouter);
app.use("/api/v1/admin", getTmApplyRequestRouter);
app.use("/api/v1/admin", acceptTmRouter);
app.use("/api/v1/admin", rejecttmRouter);
app.use("/api/v1/admin", smallRouter);
app.use("/api/v1/admin", adminBannersRouter);
app.use("/api/v1/admin", adminUpdatetmppRouter);
app.use("/api/v1/admin", cancelBookingRouter);
app.use("/api/v1/admin", generalDataRouter);
app.use("/api/v1/admin", blockTmRouter);

// taskmaster application link
app.use("/api/v1", onBoardTmRouter);

// Task Master routes
app.use('/api/v1', taskMasterAuthRouter)
app.use('/api/v1', taskMasterProfileRouter)
app.use('/api/v1', TaskMasterJobs)


app.get("/protected", protectedMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.get("/protected", (req, res) => {
  res.json({ message: "Healthy done" });
});

const PORT = process.env.PORT || 5500;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);