const express = require('express');
const router = express.Router();

const projects = require('./projects');
const tasks = require('./tasks');
const activity = require('./activity');
const stats = require('./stats');

router.use('/projects', projects);
router.use('/tasks', tasks);
router.use('/activity', activity);
router.use('/stats', stats);

module.exports = router;