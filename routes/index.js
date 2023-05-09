const express = require("express");
require("../config/passport");

const router = express.Router();

const authRouter = require("./auth");
const chatRouter = require("./chat");
const sourceRouter = require("./source");
const userRouter = require("./user");

const authMiddleware = require("../middlewares/auth");

const { jwtAuth } = authMiddleware;

router.get("/", (req, res) => {
    res.json({
        message: "This is API interface",
    });
});

router.use("/auth", authRouter);
router.use("/sources", jwtAuth, sourceRouter);
router.use("/chats", jwtAuth, chatRouter);
router.use("/users", jwtAuth, userRouter);

module.exports = router;
