'use client'

import { useSession } from 'next-auth/react'
import { ROLE_PERMISSIONS, type UserRole } from '@/lib/permissions'

// ============================================================
// usePermissions — Client-side permission checks
// Reads user role from NextAuth session and exposes helpers
// ============================================================

export interface UserPermissions {
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean

  // Permission checks
  canCreateProject: (currentProjectCount: number) => boolean
  canUseAiGeneration: (todayCount: number) => boolean
  canExport: boolean
  canManageUsers: boolean
  canAccessAllProjects: boolean

  // Limits (for UI display)
  maxProjects: number       // -1 = unlimited
  maxAiGenerationsPerDay: number // -1 = unlimited

  // Labels
  roleLabel: string
}

export function usePermissions(): UserPermissions {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  const role = (session?.user as any)?.role as UserRole ?? 'free'
  const perms = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.free

  return {
    role,
    isLoading,
    isAuthenticated,

    canCreateProject: (currentProjectCount: number) => {
      if (perms.maxProjects === -1) return true
      return currentProjectCount < perms.maxProjects
    },

    canUseAiGeneration: (todayCount: number) => {
      if (perms.maxAiGenerationsPerDay === -1) return true
      return todayCount < perms.maxAiGenerationsPerDay
    },

    canExport: perms.canExport,
    canManageUsers: perms.canManageUsers,
    canAccessAllProjects: perms.canAccessAllProjects,

    maxProjects: perms.maxProjects,
    maxAiGenerationsPerDay: perms.maxAiGenerationsPerDay,

    roleLabel: perms.label,
  }
}
