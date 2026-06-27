import { promises as fs } from 'fs';
import path from 'path';
import type { Employee } from '@/types';
import { isDbAvailable, pgGetCollection, pgSetCollection } from '@/lib/pg-store';

const DATA_DIR = path.join(process.cwd(), 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const COMPONENTS_FILE = path.join(DATA_DIR, 'salary-components.json');

interface EmployeesData {
  employees: Employee[];
}

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getAllEmployees(): Promise<Employee[]> {
  if (await isDbAvailable()) {
    const data = await pgGetCollection<{ employees: Employee[] }>('employees');
    return data.employees || [];
  }
  await ensureDataDir();
  try {
    const raw = await fs.readFile(EMPLOYEES_FILE, 'utf-8');
    const data: EmployeesData = JSON.parse(raw);
    return data.employees;
  } catch {
    return [];
  }
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await getAllEmployees();
  return employees.find((e) => e.id === id) || null;
}

export async function updateEmployee(
  id: string,
  updates: Partial<Employee>
): Promise<Employee | null> {
  const employees = await getAllEmployees();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updates, updatedAt: new Date().toISOString() };

  if (await isDbAvailable()) {
    await pgSetCollection('employees', { employees });
  } else {
    await ensureDataDir();
    await fs.writeFile(EMPLOYEES_FILE, JSON.stringify({ employees }, null, 2), 'utf-8');
  }
  return employees[idx];
}

export async function updateAllEmployees(
  updates: Employee[]
): Promise<Employee[]> {
  for (const u of updates) {
    const idx = updates.findIndex((e) => e.id === u.id);
    if (idx !== -1) {
      updates[idx] = { ...u, updatedAt: new Date().toISOString() };
    }
  }
  const data: EmployeesData = { employees: updates };

  if (await isDbAvailable()) {
    await pgSetCollection('employees', data);
  } else {
    await ensureDataDir();
    await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
  return updates;
}

// ============ Salary Components ============

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage';
  value: number;
  isTaxable: boolean;
  isActive: boolean;
}

interface ComponentsData {
  components: SalaryComponent[];
}

export async function getAllComponents(): Promise<SalaryComponent[]> {
  if (await isDbAvailable()) {
    const data = await pgGetCollection<ComponentsData>('salary-components');
    return data.components || [];
  }
  await ensureDataDir();
  try {
    const raw = await fs.readFile(COMPONENTS_FILE, 'utf-8');
    const data: ComponentsData = JSON.parse(raw);
    return data.components;
  } catch {
    return [];
  }
}

export async function updateComponent(
  id: string,
  updates: Partial<SalaryComponent>
): Promise<SalaryComponent | null> {
  const components = await getAllComponents();
  const idx = components.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  components[idx] = { ...components[idx], ...updates };

  if (await isDbAvailable()) {
    await pgSetCollection('salary-components', { components });
  } else {
    await ensureDataDir();
    await fs.writeFile(COMPONENTS_FILE, JSON.stringify({ components }, null, 2), 'utf-8');
  }
  return components[idx];
}

export async function createComponent(
  component: SalaryComponent
): Promise<SalaryComponent> {
  const components = await getAllComponents();
  components.push(component);

  if (await isDbAvailable()) {
    await pgSetCollection('salary-components', { components });
  } else {
    await ensureDataDir();
    await fs.writeFile(COMPONENTS_FILE, JSON.stringify({ components }, null, 2), 'utf-8');
  }
  return component;
}
