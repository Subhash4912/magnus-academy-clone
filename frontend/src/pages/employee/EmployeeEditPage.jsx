import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmployeeForm from '../../components/employee/EmployeeForm'
import PageHeading from '../../components/common/PageHeading'
import useAsync from '../../hooks/useAsync'
import { getEmployeeById, updateEmployee } from '../../services/employeeService'
import { employeeFormValues } from '../../utils/employeeForm'
import { routePaths } from '../../utils/navigation'

function EditEmployee({ id }) {
  const { execute, data, error, success } = useAsync()
  const navigate = useNavigate()
  useEffect(() => {
    // Errors are retained by useAsync and rendered below.
    execute(getEmployeeById, id).catch(() => undefined)
  }, [execute, id])

  if (error)
    return (
      <>
        <PageHeading
          title="Edit employee"
          description="The employee could not be loaded."
        />
        <p
          role="alert"
          className="mb-5 rounded-xl bg-rose-50 p-4 text-rose-800"
        >
          {error.message}
        </p>
        <Link
          to={routePaths.employeeSearch}
          className="font-medium text-indigo-700"
        >
          Back to Employee Search
        </Link>
      </>
    )
  if (!success)
    return (
      <p role="status" className="rounded-xl bg-white p-6">
        Loading employee...
      </p>
    )

  return (
    <>
      <Link
        to={routePaths.employeeSearch}
        className="mb-5 inline-block text-sm font-medium text-indigo-700"
      >
        Back to Employee Search
      </Link>
      <EmployeeForm
        mode="edit"
        initialValues={employeeFormValues(data.data)}
        onSave={(payload) => updateEmployee(id, payload)}
        onSaved={(result) =>
          navigate(routePaths.employeeSearch, {
            state: {
              message: result.message || 'Employee updated successfully.',
            },
          })
        }
      />
    </>
  )
}

export default function EmployeeEditPage() {
  const { id } = useParams()
  return <EditEmployee key={id} id={id} />
}
