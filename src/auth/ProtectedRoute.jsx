import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "./AuthContext"

export default function ProtectedRoute() {
  const {
    loading,
    isAuthenticated,
  } = useAuth()

  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading ExpenseFlow...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return <Outlet />
}