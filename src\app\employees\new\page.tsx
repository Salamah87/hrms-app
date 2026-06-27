'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/forms/employee-form';

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

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (_data: unknown) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push('/employees');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/employees')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Employee</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new employee record
          </p>
        </div>
      </div>

      <EmployeeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        departments={mockDepartments}
        positions={mockPositions}
        managers={mockManagers}
      />
    </div>
  );
}

