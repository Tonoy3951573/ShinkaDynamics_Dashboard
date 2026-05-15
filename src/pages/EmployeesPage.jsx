import { useState } from 'react'
import { EmployeeDirectory } from '../components/dashboard/EmployeeDirectory'
import { OperationsToolbar } from '../components/dashboard/OperationsToolbar'
import { AddEmployeeModal } from '../components/dashboard/AddEmployeeModal'
import { useDashboard } from '../context/useDashboard'

export function EmployeesPage() {
  const { sortedEmployees } = useDashboard()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between reveal-on-scroll is-visible">
        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-[color:var(--text)]">
          Employee Directory
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-[18px] bg-[color:var(--accent-blue)] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Add Employee
        </button>
      </div>
      <OperationsToolbar />
      <EmployeeDirectory employees={sortedEmployees} />
      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  )
}
