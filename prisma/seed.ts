import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';

// type UserInfo = {
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   lid: number;
//   deptId: number;
//   gender: string;
// };

// const usersInfo: UserInfo[] = [
//   {
//     firstName: 'Jose Mari',
//     lastName: 'Prats',
//     deptId: 9,
//     lid: 5,
//     gender: 'Male',
//   },
//   {
//     firstName: 'Abet',
//     lastName: 'Yaunario',
//     deptId: 9,
//     lid: 5,
//     gender: 'Male',
//   },
//   {
//     firstName: 'Catherine',
//     lastName: 'Carparas',
//     deptId: 9,
//     lid: 5,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Jona',
//     lastName: 'Yapchionco',
//     deptId: 3,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Marie Ana',
//     lastName: 'Alvarez',
//     deptId: 1,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Andy',
//     lastName: 'Pagasa',
//     deptId: 8,
//     lid: 3,
//     gender: 'Male',
//   },
//   {
//     firstName: 'Jason',
//     lastName: 'Abarca',
//     deptId: 5,
//     lid: 3,
//     gender: 'Male',
//   },
//   {
//     firstName: 'Sam',
//     lastName: 'Timtiman',
//     deptId: 4,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Ivy',
//     lastName: 'Tanamal-Perez',
//     deptId: 9,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Cathy',
//     lastName: 'Espinosa',
//     deptId: 2,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Jorrel',
//     lastName: 'Torres',
//     deptId: 8,
//     lid: 3,
//     gender: 'Male',
//   },
//   {
//     firstName: 'Armalyn',
//     lastName: 'Mariano',
//     deptId: 6,
//     lid: 3,
//     gender: 'Female',
//   },
//   {
//     firstName: 'Herbert',
//     lastName: 'Aquino',
//     deptId: 7,
//     lid: 3,
//     gender: 'Male',
//   },
// ];

const prisma = new PrismaClient();

const divisions: { divisionCode: string; divisionName: string }[] = [
  { divisionCode: 'ADM', divisionName: 'Admin' },
  { divisionCode: 'ANC', divisionName: 'Ancillary' },
  { divisionCode: 'NSD', divisionName: 'Nursing Services Division' },
];

const departments: {
  departmentName: string;
  departmentCode: string;
  divisionId: number;
}[] = [
  { departmentName: 'Human Resource', departmentCode: 'HR', divisionId: 1 },
  { departmentName: 'Quality Management', departmentCode: 'QM', divisionId: 1 },
  {
    departmentName: 'Information Technology',
    departmentCode: 'IT',
    divisionId: 1,
  },
  { departmentName: 'Marketing', departmentCode: 'MRKT', divisionId: 1 },
  { departmentName: 'Accounting', departmentCode: 'ACNT', divisionId: 1 },
  { departmentName: 'Ancillary', departmentCode: 'ANC', divisionId: 1 },
  {
    departmentName: 'Nursing Services Department',
    departmentCode: 'NSD',
    divisionId: 3,
  },
  { departmentName: 'Supply Chain', departmentCode: 'SC', divisionId: 1 },
  { departmentName: 'Support Services', departmentCode: 'SSD', divisionId: 1 },
  {
    departmentName: 'Customer Experience',
    departmentCode: 'CED',
    divisionId: 1,
  },
  { departmentCode: 'OR', departmentName: 'Operating Room', divisionId: 3 },
  { departmentCode: 'ER', departmentName: 'Emergency Room', divisionId: 3 },
  { departmentCode: 'NICU', departmentName: 'Nicu', divisionId: 3 },
  { departmentCode: 'DIA', departmentName: 'Dialysis', divisionId: 3 },
  { departmentCode: 'ICU', departmentName: 'Icu', divisionId: 3 },
  { departmentCode: 'ACU', departmentName: 'Acu', divisionId: 3 },
  { departmentCode: 'GNU4F', departmentName: '4th Floor Ward', divisionId: 3 },
  { departmentCode: 'GNU5F', departmentName: '5th Floor Ward', divisionId: 3 },
  { departmentCode: 'IMGN', departmentName: 'Imaging', divisionId: 2 },
  { departmentCode: 'CRD', departmentName: 'Cardiology', divisionId: 2 },
  { departmentCode: 'PULM', departmentName: 'Pulmonary', divisionId: 2 },
  {
    departmentCode: 'PMR',
    departmentName: 'Physical, Medicine, and Rehab',
    divisionId: 2,
  },
  { departmentCode: 'LAB', departmentName: 'Laboratory', divisionId: 2 },
  { departmentCode: 'DIET', departmentName: 'Dietary', divisionId: 2 },
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

async function seedDivision() {
  for (const division of divisions) {
    await prisma.division.upsert({
      where: { divisionCode: division.divisionCode },
      update: {},
      create: division,
    });
  }

  console.log('Division Seeded.');
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

async function updateDepartments() {
  const existingDepartments = await prisma.department.findMany();
  const existingDepartmentsMap = new Map(
    existingDepartments.map((dept) => [dept.departmentCode, dept]),
  );

  for (const department of departments) {
    if (existingDepartmentsMap.has(department.departmentCode)) {
      await prisma.department.update({
        where: { departmentName: department.departmentName },
        data: {
          departmentName: department.departmentName,
          divisionId: department.divisionId,
        },
      });
    } else {
      await prisma.department.create({
        data: department,
      });
    }
  }

  const newDepartmentCodes = new Set(
    departments.map((dept) => dept.departmentCode),
  );
  for (const existingDepartment of existingDepartments) {
    if (!newDepartmentCodes.has(existingDepartment.departmentCode)) {
      await prisma.department.delete({
        where: { departmentName: existingDepartment.departmentName },
      });
    }
  }

  console.log('Department seeding completed with updates.');
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

  // updateDepartments();

  seedEditTypes();
  seedEmployeeLevel().then(() =>
    seedDivision().then(() => seedDepartments().then(() => seedUsers())),
  );
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
