"use client"

import * as React from "react"
import { DataTable } from "@/components/table/data-table"
import { columns, type Student } from "@/components/table/columns"

function generateMockData(count: number): Student[] {
  const vietnameseNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Hoàng Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
    "Vũ Thị Phương",
    "Đặng Minh Quang",
    "Bùi Thị Hương",
    "Ngô Văn Tùng",
    "Lý Thị Lan",
    "Đinh Văn Hải",
    "Phan Thị Mai",
    "Võ Minh Nhật",
    "Đỗ Thị Oanh",
    "Tạ Văn Phúc",
    "Chu Thị Quỳnh",
    "Mai Văn Sơn",
    "Lưu Thị Tâm",
    "Hồ Văn Uy",
    "Cao Thị Vân",
  ]

  const faculties = [
    "Công nghệ thông tin",
    "Kinh tế",
    "Ngoại ngữ",
    "Kỹ thuật",
    "Y học",
    "Luật",
    "Giáo dục",
    "Nông nghiệp",
    "Thể dục thể thao",
    "Nghệ thuật",
  ]

  const majors = [
    "Khoa học máy tính",
    "Hệ thống thông tin",
    "An toàn thông tin",
    "Quản trị kinh doanh",
    "Kế toán",
    "Tài chính ngân hàng",
    "Tiếng Anh",
    "Tiếng Trung",
    "Cơ khí",
    "Điện tử viễn thông",
    "Xây dựng",
    "Y khoa",
    "Dược",
    "Luật kinh tế",
  ]

  const campuses = ["Cơ sở 1", "Cơ sở 2", "Cơ sở 3"]
  const educationLevels = ["Đại học", "Thạc sĩ", "Tiến sĩ"]
  const trainingTypes = ["Chính quy", "Liên thông", "Từ xa"]
  const genders = ["Nam", "Nữ"]
  const provinces = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Nghệ An",
    "Thanh Hóa",
    "Quảng Nam",
    "Bình Dương",
    "Đồng Nai",
  ]

  return Array.from({ length: count }, (_, i) => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentId = `${year}${String(i + 1).padStart(6, "0")}`
    const name = vietnameseNames[Math.floor(Math.random() * vietnameseNames.length)]
    const faculty = faculties[Math.floor(Math.random() * faculties.length)]
    const major = majors[Math.floor(Math.random() * majors.length)]
    const gender = genders[Math.floor(Math.random() * genders.length)]
    const birthYear = 1995 + Math.floor(Math.random() * 10)
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")
    const enrollmentMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")
    const enrollmentDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")
    const province = provinces[Math.floor(Math.random() * provinces.length)]

    return {
      mssv: studentId,
      ho_ten: name,
      gioi_tinh: gender,
      ngay_vao_truong: `${enrollmentDay}/${enrollmentMonth}/${year}`,
      lop_hoc: `${major.substring(0, 2).toUpperCase()}${year.toString().slice(-2)}A${Math.floor(Math.random() * 5) + 1}`,
      co_so: campuses[Math.floor(Math.random() * campuses.length)],
      bac_dao_tao: educationLevels[Math.floor(Math.random() * educationLevels.length)],
      loai_hinh_dao_tao: trainingTypes[Math.floor(Math.random() * trainingTypes.length)],
      khoa: faculty,
      nganh: major,
      chuyen_nganh: Math.random() > 0.5 ? `${major} - Chuyên sâu` : null,
      khoa_hoc: `K${year.toString().slice(-2)}`,
      noi_cap: province,
      ngay_sinh: `${birthDay}/${birthMonth}/${birthYear}`,
      so_cmnd: `${Math.floor(Math.random() * 900000000) + 100000000}`,
      doi_tuong: Math.random() > 0.7 ? "Ưu tiên" : "Bình thường",
      ngay_vao_doan: Math.random() > 0.3 ? `${birthDay}/${birthMonth}/${birthYear + 16}` : null,
      dien_thoai: `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, "0")}`,
      dia_chi_lien_he: `${Math.floor(Math.random() * 999) + 1} Đường ${Math.floor(Math.random() * 50) + 1}, ${province}`,
      noi_sinh: province,
      ho_khau_thuong_tru: `${Math.floor(Math.random() * 999) + 1} Đường ${Math.floor(Math.random() * 50) + 1}, ${province}`,
      email_dnc: `${studentId}@student.university.edu.vn`,
      mat_khau_email_dnc: Math.random() > 0.5 ? `Pass${Math.floor(Math.random() * 10000)}` : null,
      ma_ho_so: `HS${year}${String(i + 1).padStart(4, "0")}`,
    }
  })
}

export default function StudentManagementPage() {
  const [data] = React.useState(() => generateMockData(1000))

  return (
    <div className="p-3 sm:p-4">
      <h1 className="text-3xl font-bold mb-8">Advanced Data Table</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
