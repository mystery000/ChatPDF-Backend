const express = require("express");
require("../config/passport");

const router = express.Router();

const authRouter = require("./auth");
const chatRouter = require("./chat");
const sourceRouter = require("./source");

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

module.exports = router;
