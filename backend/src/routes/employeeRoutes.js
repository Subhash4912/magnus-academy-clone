const express = require('express');
const controller = require('../controllers/employeeController');
const { validateEmployeeBody, validateEmployeeId } = require('../middleware/validateEmployee');

const router = express.Router();

router.route('/')
  .get(controller.getEmployees)
  .post(validateEmployeeBody, controller.createEmployee);

router.route('/:id')
  .all(validateEmployeeId)
  .get(controller.getEmployeeById)
  .put(validateEmployeeBody, controller.updateEmployee)
  .delete(controller.deleteEmployee);

module.exports = router;
