'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/forms/employee-form';
import { PageLoading } from '@/components/ui/loading';
import type { Employee } from '@/types';

const mockDepartments = [
  { value: 'dept-1', label: 'Engineering' },
  { value: 'dept-2', label: 'Marketing' },
  { value: 'dept-3', label: 'Sales' },
  { value: 'dept-4', label: 'Finance' },
  { value: 'dept-5', label: 'HR' },
];

const mockPositions = [
  { value: 'pos-1', label: 'Frontend Developer' },
  { value: 'pos-2', label: 'Backend Developer' },
  { value: 'pos-3', label: 'Designer' },
  { value: 'pos-4', label: 'Product Manager' },
  { value: 'pos-5', label: 'Sales Rep' },
  { value: 'pos-6', label: 'Accountant' },
  { value: 'pos-7', label: 'HR Officer' },
  { value: 'pos-8', label: 'Marketing Specialist' },
];

const mockManagers = [
  { value: 'emp-1', label: 'Ahmad Khaled' },
  { value: 'emp-2', label: 'Sarah Johnson' },
  { value: 'emp-3', label: 'Michael Brown' },
  { value: 'emp-4', label: 'Nora Hassan' },
  { value: 'emp-5', label: 'Robert Wilson' },
];

const mockEmployee: Employee = {
  id: 'emp-1',
  employeeNumber: 'EMP-0001',
  firstName: 'Ahmad',
  lastName: 'Khaled',
  fullName: 'Ahmad Khaled',
  email: 'ahmad.khaled@company.com',
  phone: '+966 55 123 4567',
  mobile: '+966 50 987 6543',
  dateOfBirth: '1990-05-15T00:00:00.000Z',
  gender: 'male',
  nationality: 'Saudi',
  nationalId: '1012345678',
  passportNumber: 'N123456789',
  address: 'King Fahd Road, Olaya District',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  departmentId: 'dept-1',
  positionId: 'pos-1',
  managerId: 'emp-3',
  employmentType: 'full_time',
  status: 'active',
  joiningDate: '2021-03-01T00:00:00.000Z',
  contractEndDate: '2024-03-01T00:00:00.000Z',
  salary: 15000,
  currency: 'SAR',
  bankAccount: 'SA1234567890123456789012',
  bankName: 'Al Rajhi Bank',
  createdAt: '2021-03-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmployee(mockEmployee);
    setIsLoading(false);
  }, []);

  const handleSubmit = async (_data: unknown) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push(`/employees/${params.id}`);
  };

  if (isLoading) return <PageLoading message="Loading employee data..." />;
  if (!employee) return <div className="p-6 text-center text-gray-500">Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Employee</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {employee.firstName} {employee.lastName} • {employee.employeeNumber}
          </p>
        </div>
      </div>

      <EmployeeForm
        employee={employee}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        departments={mockDepartments}
        positions={mockPositions}
        managers={mockManagers}
      />
    </div>
  );
}
