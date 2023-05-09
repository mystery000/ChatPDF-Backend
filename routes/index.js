const express = require("express");
require("../config/passport");

const router = express.Router();

const authRouter = require("./auth");
const dataRouter = require("./data");

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
router.use("/data", dataRouter);
router.use("/sources", sourceRouter);
router.use("/chats", chatRouter);

module.exports = router;
