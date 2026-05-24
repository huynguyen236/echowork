/**
 * EchoWork Database Seeder
 * Run: node prisma/seed.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EchoWork seed...\n');

  // ─── Clear existing data (in dependency order) ────────────────────────────
  await prisma.accessibilitySetting.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑  Cleared existing data');

  // ─── Hash password ────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 12);

  // ─── Users ────────────────────────────────────────────────────────────────
  const [admin, recruiter1, recruiter2, candidate1, candidate2] = await Promise.all([
    prisma.user.create({
      data: {
        fullName: 'Admin EchoWork',
        email: 'admin@echowork.vn',
        password: await hash('Admin@123'),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Nguyễn Văn Tuyển',
        email: 'recruiter@fpt.com.vn',
        password: await hash('Recruiter@123'),
        role: 'RECRUITER',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Trần Thị Hương',
        email: 'hr@vng.com.vn',
        password: await hash('Recruiter@123'),
        role: 'RECRUITER',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Phạm Minh Đức',
        email: 'candidate@gmail.com',
        password: await hash('Candidate@123'),
        role: 'CANDIDATE',
        disability: 'Khiếm thính',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Lê Thị Mai',
        email: 'mai.le@gmail.com',
        password: await hash('Candidate@123'),
        role: 'CANDIDATE',
        disability: 'Vận động',
      },
    }),
  ]);
  console.log('👤 Created 5 users (1 admin, 2 recruiters, 2 candidates)');

  // ─── Jobs ─────────────────────────────────────────────────────────────────
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Frontend Engineer',
        description: 'Phát triển giao diện web hiện đại sử dụng React.js và TypeScript. Làm việc trong môi trường thân thiện, có ramp dành cho xe lăn và thang máy.',
        salary: 35000000,
        location: 'Hà Nội',
        companyName: 'FPT Telecom',
        userId: recruiter1.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Chuyên viên Phân tích Dữ liệu',
        description: 'Phân tích dữ liệu kinh doanh, xây dựng dashboard báo cáo. Hỗ trợ làm việc remote 100% hoặc hybrid. Phù hợp với người khuyết tật vận động.',
        salary: 28000000,
        location: 'TP. Hồ Chí Minh',
        companyName: 'VNG Corporation',
        userId: recruiter2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Chuyên viên Marketing Digital',
        description: 'Quản lý các kênh marketing online, SEO, content marketing. Môi trường làm việc hoàn toàn remote, thân thiện với người khuyết tật.',
        salary: 20000000,
        location: 'Đà Nẵng',
        companyName: 'Shopee Vietnam',
        userId: recruiter1.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Lập trình viên Backend Node.js',
        description: 'Xây dựng và tối ưu hóa các API RESTful. Làm việc trong môi trường Agile. Văn phòng có đầy đủ tiện nghi cho người khuyết tật.',
        salary: 30000000,
        location: 'Hà Nội',
        companyName: 'Tiki Corporation',
        userId: recruiter2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Chuyên viên Kế toán',
        description: 'Quản lý sổ sách kế toán, lập báo cáo tài chính. Giờ làm việc linh hoạt, hỗ trợ làm việc từ xa một phần.',
        salary: 18000000,
        location: 'Hà Nội',
        companyName: 'MB Bank',
        userId: recruiter1.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Nhân viên Chăm sóc Khách hàng',
        description: 'Hỗ trợ khách hàng qua chat và email. Vị trí phù hợp với người khiếm thính vì giao tiếp chủ yếu qua văn bản.',
        salary: 12000000,
        location: 'TP. Hồ Chí Minh',
        companyName: 'Lazada Vietnam',
        userId: recruiter2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'UX/UI Designer',
        description: 'Thiết kế giao diện người dùng thân thiện và đẹp mắt. Ưu tiên ứng viên hiểu về thiết kế tiếp cận (accessible design).',
        salary: 25000000,
        location: 'Hà Nội',
        companyName: 'Zalo (VNG)',
        userId: recruiter2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Nhân viên Kinh doanh Online',
        description: 'Tư vấn và bán hàng qua các kênh online. Làm việc từ xa 100%, phù hợp với mọi đối tượng.',
        salary: 15000000,
        location: 'Toàn quốc (Remote)',
        companyName: 'Vincommerce',
        userId: recruiter1.id,
      },
    }),
  ]);
  console.log(`💼 Created ${jobs.length} job listings`);

  // ─── Applications ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.application.create({
      data: { userId: candidate1.id, jobId: jobs[0].id, status: 'PENDING' },
    }),
    prisma.application.create({
      data: { userId: candidate1.id, jobId: jobs[2].id, status: 'ACCEPTED' },
    }),
    prisma.application.create({
      data: { userId: candidate2.id, jobId: jobs[1].id, status: 'PENDING' },
    }),
    prisma.application.create({
      data: { userId: candidate2.id, jobId: jobs[5].id, status: 'REJECTED' },
    }),
  ]);
  console.log('📋 Created 4 applications');

  // ─── CVs ──────────────────────────────────────────────────────────────────
  await prisma.cV.create({
    data: {
      userId: candidate1.id,
      summary: 'Kỹ sư phần mềm với 3 năm kinh nghiệm phát triển web. Đam mê công nghệ và mong muốn đóng góp vào các dự án có tác động xã hội.',
      education: JSON.stringify([
        { degree: 'Cử nhân Công nghệ Thông tin', school: 'Đại học Bách Khoa Hà Nội', year: '2018 - 2022', description: 'Tốt nghiệp loại Giỏi, GPA 3.6/4.0' },
      ]),
      experience: JSON.stringify([
        { position: 'Frontend Developer', company: 'TechVina JSC', duration: '2022 - Hiện tại', description: 'Phát triển các ứng dụng web sử dụng React.js, TypeScript. Cải thiện hiệu suất trang web lên 40%.' },
        { position: 'Intern Web Developer', company: 'FPT Software', duration: '2021 - 2022', description: 'Thực tập phát triển backend với Node.js và Express.' },
      ]),
      skills: JSON.stringify(['React.js', 'TypeScript', 'Node.js', 'MySQL', 'Git', 'Figma', 'Agile/Scrum']),
      template: 'default',
    },
  });

  await prisma.cV.create({
    data: {
      userId: candidate2.id,
      summary: 'Chuyên viên kế toán với 4 năm kinh nghiệm trong lĩnh vực tài chính doanh nghiệp. Kỹ năng làm việc tỉ mỉ và chính xác.',
      education: JSON.stringify([
        { degree: 'Cử nhân Kế toán', school: 'Đại học Kinh tế TP.HCM', year: '2016 - 2020', description: 'Tốt nghiệp loại Khá' },
      ]),
      experience: JSON.stringify([
        { position: 'Kế toán viên', company: 'ABC Logistics', duration: '2020 - Hiện tại', description: 'Quản lý sổ sách kế toán, lập báo cáo tài chính hàng tháng.' },
      ]),
      skills: JSON.stringify(['Excel', 'MISA', 'Kế toán tài chính', 'Báo cáo thuế', 'SAP']),
      template: 'default',
    },
  });
  console.log('📄 Created 2 CVs');

  // ─── Accessibility Settings ────────────────────────────────────────────────
  await Promise.all([
    prisma.accessibilitySetting.create({
      data: { userId: candidate1.id, fontSize: 'large', contrastMode: 'normal' },
    }),
    prisma.accessibilitySetting.create({
      data: { userId: candidate2.id, fontSize: 'medium', contrastMode: 'high' },
    }),
  ]);
  console.log('♿ Created 2 accessibility settings\n');

  console.log('✅ Seed completed successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('🔑 Login credentials:');
  console.log('   Admin     → admin@echowork.vn     / Admin@123');
  console.log('   Recruiter → recruiter@fpt.com.vn  / Recruiter@123');
  console.log('   Recruiter → hr@vng.com.vn          / Recruiter@123');
  console.log('   Candidate → candidate@gmail.com    / Candidate@123');
  console.log('   Candidate → mai.le@gmail.com       / Candidate@123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
