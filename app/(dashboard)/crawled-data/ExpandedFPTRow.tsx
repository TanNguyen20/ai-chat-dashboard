import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FPTResponseDTO } from "@/services/fpt"

interface ExpandedFPTRowProps {
  readonly user: FPTResponseDTO
}

export function ExpandedFPTRow({ user }: ExpandedFPTRowProps) {
  return (
    <div className="p-3 sm:p-4 bg-muted/30 border-t">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Personal info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Display Name:</span>
              <p className="text-sm">{user.displayName || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Email:</span>
              <p className="text-sm">{user.mail || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Phone:</span>
              <p className="text-sm">{user.mobilePhone || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Job info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Job Title:</span>
              <p className="text-sm">{user.jobTitle || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Office:</span>
              <p className="text-sm">{user.officeLocation || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Username:</span>
              <p className="text-sm">{user.userPrincipalName || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Other info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Language:</span>
              <Badge variant="secondary" className="text-xs">
                {user.preferredLanguage || "N/A"}
              </Badge>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Type:</span>
              <p className="text-sm">{user.odataType || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Business Phones:</span>
              <p className="text-sm">{user.businessPhones?.join(", ") || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
