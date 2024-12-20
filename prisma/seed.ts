import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const yap = console.log;

type UserInfo = {
  firstName: string;
  middleName?: string;
  lastName: string;
  lid: number;
  deptId: number;
  gender: string;
};

const usersInfo: UserInfo[] = [
  {
    firstName: 'Jose Mari',
    lastName: 'Prats',
    deptId: 9,
    lid: 5,
    gender: 'Male',
  },
  {
    firstName: 'Abet',
    lastName: 'Yaunario',
    deptId: 9,
    lid: 5,
    gender: 'Male',
  },
  {
    firstName: 'Catherine',
    lastName: 'Carparas',
    deptId: 9,
    lid: 5,
    gender: 'Female',
  },
  {
    firstName: 'Jona',
    lastName: 'Yapchionco',
    deptId: 3,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Marie Ana',
    lastName: 'Alvarez',
    deptId: 1,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Andy',
    lastName: 'Pagasa',
    deptId: 8,
    lid: 3,
    gender: 'Male',
  },
  {
    firstName: 'Jason',
    lastName: 'Abarca',
    deptId: 5,
    lid: 3,
    gender: 'Male',
  },
  {
    firstName: 'Sam',
    lastName: 'Timtiman',
    deptId: 4,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Ivy',
    lastName: 'Tanamal-Perez',
    deptId: 9,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Cathy',
    lastName: 'Espinosa',
    deptId: 2,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Jorrel',
    lastName: 'Torres',
    deptId: 8,
    lid: 3,
    gender: 'Male',
  },
  {
    firstName: 'Armalyn',
    lastName: 'Mariano',
    deptId: 6,
    lid: 3,
    gender: 'Female',
  },
  {
    firstName: 'Herbert',
    lastName: 'Aquino',
    deptId: 7,
    lid: 3,
    gender: 'Male',
  },
];

yap(usersInfo);

const prisma = new PrismaClient();

const departments = [
  { departmentName: 'Human Resource', departmentCode: 'HR' },
  { departmentName: 'Quality Management', departmentCode: 'QM' },
  { departmentName: 'Information Technology', departmentCode: 'IT' },
  { departmentName: 'Marketing', departmentCode: 'MRKT' },
  { departmentName: 'Accounting', departmentCode: 'ACNT' },
  { departmentName: 'Ancillary', departmentCode: 'ANC' },
  { departmentName: 'Nursing Services Department', departmentCode: 'NSD' },
  { departmentName: 'Supply Chain', departmentCode: 'SC' },
  { departmentName: 'Support Services', departmentCode: 'SSD' },
  { departmentName: 'Customer Experience', departmentCode: 'CED' },
  { departmentName: 'Executive', departmentCode: 'EXEC' },
];

async function seedEditTypes() {
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
}

async function seedEmployeeLevel() {
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
}

async function seedDepartments() {
  for (const department of departments) {
    await prisma.department.upsert({
      where: { departmentName: department.departmentName },
      update: {},
      create: department,
    });
  }
  console.log('Department seeded.');
}

async function seedUsers() {
  const departmentsCount = departments.length;
  const usersPerDepartment = 6;

  const users = [];
  let employeeIdCounter = 1010;

  for (let deptId = 1; deptId <= departmentsCount; deptId++) {
    for (let i = 0; i < usersPerDepartment; i++) {
      let lid;

      if (i === 0) {
        lid = 2;
      } else if (i === 1) {
        lid = 3;
      } else if (i === 2) {
        lid = 4;
      } else {
        lid = 1;
      }

      const email = `user${deptId}${i}${uuidv4()}@westlakemed.com.ph`;
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
        employeeId: employeeIdCounter++,
        lid,
        confirmed: lid >= 2 ? true : false,
      });
    }
  }

  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log('Users seeded.');
}

async function main() {
  console.log('Seeding database...');

  seedEditTypes();
  seedEmployeeLevel();
  seedDepartments();
  seedUsers();
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
