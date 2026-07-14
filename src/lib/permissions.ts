// ============================================================
// Permission constants — Safe for both client and server
// This file must NOT import any server-only modules (db, bcrypt, etc.)
// ============================================================

export type UserRole = 'free' | 'pro' | 'admin'

export const ROLE_PERMISSIONS: Record<UserRole, {
  label: string
  maxProjects: number       // -1 = unlimited
  maxAiGenerationsPerDay: number // -1 = unlimited
  canExport: boolean
  canManageUsers: boolean
  canAccessAllProjects: boolean
}> = {
  free: {
    label: '免费用户',
    maxProjects: 3,
    maxAiGenerationsPerDay: 20,
    canExport: false,
    canManageUsers: false,
    canAccessAllProjects: false,
  },
  pro: {
    label: '专业版',
    maxProjects: -1,
    maxAiGenerationsPerDay: -1,
    canExport: true,
    canManageUsers: false,
    canAccessAllProjects: false,
  },
  admin: {
    label: '管理员',
    maxProjects: -1,
    maxAiGenerationsPerDay: -1,
    canExport: true,
    canManageUsers: true,
    canAccessAllProjects: true,
  },
}

export function getPermissions(role: string) {
  return ROLE_PERMISSIONS[role as UserRole] ?? ROLE_PERMISSIONS.free
}

export function canCreateProject(role: string, currentProjectCount: number): boolean {
  const perms = getPermissions(role)
  if (perms.maxProjects === -1) return true
  return currentProjectCount < perms.maxProjects
}

export function canUseAiGeneration(role: string, todayCount: number): boolean {
  const perms = getPermissions(role)
  if (perms.maxAiGenerationsPerDay === -1) return true
  return todayCount < perms.maxAiGenerationsPerDay
}
