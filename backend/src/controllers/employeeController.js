const Employee = require('../models/Employee');
const HttpError = require('../utils/HttpError');

function searchValue(value) {
  if (value === undefined) return '';
  if (typeof value !== 'string') throw new HttpError(400, 'Search parameters must be strings');
  // User text is literal, never a client-supplied regex or MongoDB expression.
  return value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findEmployee(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw new HttpError(404, 'Employee not found');
  return employee;
}

async function createEmployee(req, res) {
  const employee = await Employee.create(req.body);
  res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
}

async function getEmployees(req, res) {
  if (Object.keys(req.query).some((key) => !['name', 'mobile'].includes(key))) {
    throw new HttpError(400, 'Supported search parameters are name and mobile');
  }
  const name = searchValue(req.query.name);
  const mobile = searchValue(req.query.mobile);
  const filter = {};
  if (name) filter.$or = [{ firstName: { $regex: name, $options: 'i' } }, { lastName: { $regex: name, $options: 'i' } }];
  if (mobile) filter.mobile = { $regex: mobile, $options: 'i' };
  const employees = await Employee.find(filter).sort({ createdAt: -1, _id: -1 });
  res.json({ success: true, message: employees.length ? 'Employees fetched successfully' : 'No employees found', data: employees });
}

async function getEmployeeById(req, res) {
  const employee = await findEmployee(req.params.id);
  res.json({ success: true, message: 'Employee fetched successfully', data: employee });
}

async function updateEmployee(req, res) {
  const employee = await findEmployee(req.params.id);
  employee.set(req.body);
  // Document save validates the entire employee and maintains timestamps.
  await employee.save();
  res.json({ success: true, message: 'Employee updated successfully', data: employee });
}

async function deleteEmployee(req, res) {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new HttpError(404, 'Employee not found');
  res.json({ success: true, message: 'Employee deleted successfully', data: null });
}

module.exports = { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee };
