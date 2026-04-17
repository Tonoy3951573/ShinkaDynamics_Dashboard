import { EmployeeDirectory } from '../components/dashboard/EmployeeDirectory'
import { OperationsToolbar } from '../components/dashboard/OperationsToolbar'
import { useDashboard } from '../context/useDashboard'

export function EmployeesPage() {
  const { sortedEmployees } = useDashboard()

  return (
    <>
      <OperationsToolbar />
      <EmployeeDirectory employees={sortedEmployees} />
    </>
  )
}
