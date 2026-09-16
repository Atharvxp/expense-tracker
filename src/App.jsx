import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import ProtectedRoute from "./auth/ProtectedRoute"

import AppLayout from "./layout/AppLayout"

import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Reports from "./pages/Reports"
import Budgets from "./pages/Budgets"
import Settings from "./pages/Settings"

import Login from "./pages/Login"
import Signup from "./pages/Signup"

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              element={<AppLayout />}
            >
              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/transactions"
                element={<Transactions />}
              />

              <Route
                path="/reports"
                element={<Reports />}
              />

              <Route
                path="/budgets"
                element={<Budgets />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
    </BrowserRouter>
  )
}