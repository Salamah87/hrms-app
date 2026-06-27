import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { getAllEmployees, updateAllEmployees } from '@/lib/data-store';
import type { Employee } from '@/types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    const existing = await getAllEmployees();
    const maxNum = existing.reduce((max, e) => {
      const num = parseInt(e.employeeNumber?.replace('EMP', '') || '0', 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const errors: { row: number; message: string }[] = [];
    const newEmployees: Employee[] = [];
    let seq = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstName = (row.firstName || row.FirstName || row['First Name'] || '').trim();
      const lastName = (row.lastName || row.LastName || row['Last Name'] || '').trim();
      const email = (row.email || row.Email || '').trim().toLowerCase();
      const departmentId = row.departmentId || row.DepartmentId || row.Department || '';
      const positionId = row.positionId || row.PositionId || row.Title || row.Position || '';
      const joiningDate = row.joiningDate || row.JoiningDate || row['Joining Date'] || new Date().toISOString().slice(0, 10);

      if (!firstName) { errors.push({ row: i + 1, message: 'Missing first name' }); continue; }
      if (!email) { errors.push({ row: i + 1, message: 'Missing email' }); continue; }

      if (existing.find((e) => e.email.toLowerCase() === email) || newEmployees.find((e) => e.email.toLowerCase() === email)) {
        errors.push({ row: i + 1, message: `Duplicate email: ${email}` }); continue;
      }

      seq++;
      const fullName = `${firstName} ${lastName}`.trim();
      newEmployees.push({
        id: `emp-${Date.now()}-${seq}`,
        employeeNumber: `EMP${String(maxNum + seq).padStart(4, '0')}`,
        firstName,
        lastName,
      fullName,
      email,
      phone: row.phone || row.Phone || '',
      address: row.location || row.Location || row.address || '',
      departmentId: departmentId || undefined,
      positionId: positionId || undefined,
        employmentType: 'full_time',
        status: 'active',
        joiningDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (newEmployees.length > 0) {
      await updateAllEmployees([...existing, ...newEmployees]);
    }

    return NextResponse.json({
      imported: newEmployees.length,
      errors,
      employees: newEmployees,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Import failed', details: String(err) }, { status: 500 });
  }
}
