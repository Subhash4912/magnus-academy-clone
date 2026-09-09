import EmployeeForm from '../../components/employee/EmployeeForm'
import { createEmployee } from '../../services/employeeService'

export default function EmployeeCreatePage() {
  return <EmployeeForm onSave={createEmployee} />
}
