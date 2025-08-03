export interface SupersetToken {
    token: string;
}

export interface AnalyticsDashboard {
    id:number,
    dashboardId: string,
    dashboardHost: string,
    dashboardTitle: string,
    roles: Array<string>,
    users: Array<string>,
    analyticsConfigId: number,
}

export interface CreateAnalyticsDashboard {
  dashboardId: string
  analyticsConfigId: number
  dashboardHost: string
  dashboardTitle: string
  roles: string[]
  users: string[]
}