import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { EmployeeProfilePage } from '../components/dashboard/EmployeeProfilePage'

export function EmployeeProfileRoutePage({ employees }) {
  const navigate = useNavigate()
  const { employeeId } = useParams()
  const employee =
    employees.find((entry) => entry.profile?.employeeId === employeeId) ?? null

  if (!employee) {
    return <Navigate to="/employees" replace />
  }

  return (
    <EmployeeProfilePage
      employee={employee}
      onBack={() => {
        navigate('/employees')
      }}
    />
  )
}
