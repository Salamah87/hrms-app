'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { EMPLOYMENT_TYPES } from '@/lib/constants';
import type { Employee } from '@/types';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  avatar: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  employmentType: z.string().min(1, 'Employment type is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  contractEndDate: z.string().optional(),
  salary: z.string().optional(),
  currency: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  managerId: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  isSubmitting?: boolean;
  departments?: { value: string; label: string }[];
  positions?: { value: string; label: string }[];
  managers?: { value: string; label: string }[];
}

export function EmployeeForm({
  employee,
  onSubmit,
  isSubmitting,
  departments = [],
  positions = [],
  managers = [],
}: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState('personal');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      employmentType: 'full_time',
      joiningDate: '',
      currency: 'SAR',
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        avatar: employee.avatar || '',
        phone: employee.phone || '',
        mobile: employee.mobile || '',
        dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
        gender: employee.gender || '',
        nationality: employee.nationality || '',
        nationalId: employee.nationalId || '',
        passportNumber: employee.passportNumber || '',
        address: employee.address || '',
        city: employee.city || '',
        country: employee.country || '',
        employmentType: employee.employmentType || 'full_time',
        joiningDate: employee.joiningDate?.split('T')[0] || '',
        contractEndDate: employee.contractEndDate?.split('T')[0] || '',
        salary: employee.salary?.toString() || '',
        currency: employee.currency || 'SAR',
        bankAccount: employee.bankAccount || '',
        bankName: employee.bankName || '',
        departmentId: employee.departmentId || '',
        positionId: employee.positionId || '',
        managerId: employee.managerId || '',
      });
    }
  }, [employee, reset]);

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Avatar URL"
            {...register('avatar')}
            placeholder="https://example.com/photo.jpg"
            error={errors.avatar?.message}
          />
          <Input
            label="Phone"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Mobile"
            {...register('mobile')}
            error={errors.mobile?.message}
          />
          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
          />
          <Select
            label="Gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            {...register('gender')}
            placeholder="Select gender"
          />
          <Input
            label="Nationality"
            {...register('nationality')}
            error={errors.nationality?.message}
          />
          <Input
            label="National ID"
            {...register('nationalId')}
            error={errors.nationalId?.message}
          />
          <Input
            label="Passport Number"
            {...register('passportNumber')}
            error={errors.passportNumber?.message}
          />
        </div>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>
          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            label="Country"
            {...register('country')}
            error={errors.country?.message}
          />
        </div>
      ),
    },
    {
      id: 'employment',
      label: 'Employment',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Employment Type"
            options={EMPLOYMENT_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            {...register('employmentType')}
            error={errors.employmentType?.message}
            placeholder="Select type"
          />
          <Input
            label="Joining Date"
            type="date"
            {...register('joiningDate')}
            error={errors.joiningDate?.message}
          />
          <Input
            label="Contract End Date"
            type="date"
            {...register('contractEndDate')}
            error={errors.contractEndDate?.message}
          />
          <Select
            label="Department"
            options={departments}
            {...register('departmentId')}
            placeholder="Select department"
          />
          <Select
            label="Position"
            options={positions}
            {...register('positionId')}
            placeholder="Select position"
          />
          <Select
            label="Manager"
            options={managers}
            {...register('managerId')}
            placeholder="Select manager"
          />
        </div>
      ),
    },
    {
      id: 'financial',
      label: 'Financial',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Salary"
            type="number"
            {...register('salary')}
            error={errors.salary?.message}
          />
          <Select
            label="Currency"
            options={[
              { value: 'SAR', label: 'SAR - Saudi Riyal' },
              { value: 'USD', label: 'USD - US Dollar' },
              { value: 'AED', label: 'AED - UAE Dirham' },
            ]}
            {...register('currency')}
          />
          <Input
            label="Bank Account"
            {...register('bankAccount')}
            error={errors.bankAccount?.message}
          />
          <Input
            label="Bank Name"
            {...register('bankName')}
            error={errors.bankName?.message}
          />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{employee ? 'Edit Employee' : 'Add Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            tabs={tabs}
            defaultTab="personal"
            onChange={setActiveTab}
          />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {employee ? 'Update Employee' : 'Create Employee'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
