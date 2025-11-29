import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentResponseDTO } from "@/services/student"

interface ExpandedStudentRowProps {
  readonly student: StudentResponseDTO
}

export function ExpandedStudentRow({ student }: ExpandedStudentRowProps) {
  return (
    <div className="p-3 sm:p-4 bg-muted/30 border-t">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Personal info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Phone number:</span>
              <p className="text-sm">{student.dienThoai || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Email:</span>
              <p className="text-sm">{student.emailDnc || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Address:</span>
              <p className="text-sm">{student.diaChiLienHe || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Academic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Campus:</span>
              <p className="text-sm">{student.coSo || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Type of education:</span>
              <p className="text-sm">{student.loaiHinhDaoTao || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Major:</span>
              <p className="text-sm">{student.chuyenNganh || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Additional info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Date of birth:</span>
              <p className="text-sm">{student.ngaySinh || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Identity number:</span>
              <p className="text-sm font-mono">{student.soCmnd || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sex:</span>
              <Badge
                variant={student.gioiTinh === "Nam" ? "default" : student.gioiTinh === "Nữ" ? "secondary" : "outline"}
                className="text-xs"
              >
                {student.gioiTinh || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
