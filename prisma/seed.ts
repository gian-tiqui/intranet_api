import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const editTypes = [
    { id: 1, type: 'Post' },
    { id: 2, type: 'Comment' },
    { id: 3, type: 'User' },
    { id: 4, type: 'Password' },
    { id: 5, type: 'Department' },
  ];

  await prisma.editType.deleteMany();

  for (const editType of editTypes) {
    await prisma.editType.upsert({
      where: { id: editType.id },
      update: {},
      create: editType,
    });
  }
  console.log('EditType seeded.');

  const employeeLevels = [
    { level: 'All Employees' },
    { level: 'Supervisor' },
    { level: 'Department Head' },
    { level: 'Division Head' },
    { level: 'Executive Officer' },
  ];

  await prisma.employeeLevel.deleteMany();

  for (const level of employeeLevels) {
    await prisma.employeeLevel.create({
      data: level,
    });
  }
  console.log('EmployeeLevel seeded.');

  const departments = [
    { departmentName: 'Human Resource', departmentCode: 'HR' },
    { departmentName: 'Quality Management', departmentCode: 'QM' },
    { departmentName: 'Information Technology', departmentCode: 'IT' },
    { departmentName: 'Administrator', departmentCode: 'ADMIN' },
    { departmentName: 'Marketing', departmentCode: 'MRKT' },
    { departmentName: 'Accounting', departmentCode: 'ACNT' },
    { departmentName: 'Credit and Collection', departmentCode: 'CC' },
    { departmentName: 'Nursing Services Department', departmentCode: 'NSD' },
    { departmentName: 'Executive', departmentCode: 'EXEC' },
  ];

  await prisma.department.deleteMany();

  for (const department of departments) {
    await prisma.department.upsert({
      where: { departmentName: department.departmentName },
      update: {},
      create: department,
    });
  }
  console.log('Department seeded.');

  const departmentsCount = 9;
  const usersPerDepartment = 4;

  const users = [];

  for (let deptId = 1; deptId <= departmentsCount; deptId++) {
    for (let i = 0; i < usersPerDepartment; i++) {
      const lid = i < 2 ? i + 3 : 1;
      const email = `user${deptId}${i}${uuidv4()}@example.com`;
      const password = await argon.hash('password1');

      users.push({
        email,
        password,
        firstName: `FirstName${deptId}${i}`,
        middleName: '',
        lastName: `LastName${deptId}${i}`,
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: `Address${deptId}${i}`,
        city: `City${deptId}`,
        state: `State${deptId}`,
        zipCode: 4000 + deptId + i,
        dob: new Date(1990, deptId % 12, 15 + i).toISOString(),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        deptId,
        employeeId: 1000 + deptId * 10 + i + Math.floor(Math.random() * 1000),
        lid,
        confirmed: lid >= 3 ? true : false,
      });
    }
  }

  // Optionally delete existing users
  await prisma.user.deleteMany(); // Ensure no duplicates

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log('Users seeded.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
