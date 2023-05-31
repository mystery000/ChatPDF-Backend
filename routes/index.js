const express = require('express');
require('../config/passport');

const router = express.Router();

const authRouter = require('./auth');
const userRouter = require('./user');
const sourceRouter = require('./sourceRoutes');

const authMiddleware = require('../middlewares/auth');

const { jwtAuth } = authMiddleware;

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        data: 'This is Landlord API Interface',
    });
});

router.use('/auth', authRouter);
router.use('/users', jwtAuth, userRouter);
router.use('/sources', jwtAuth, sourceRouter);

module.exports = router;
