import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, ArrowLeftRight, BarChart3, WalletCards, Settings, Plus, LogOut, X } from "lucide-react"
import { useState } from "react"
import TransactionModal from "../components/TransactionModal"
import { useApp } from "../context/AppContext"
import { useAuth } from "../auth/AuthContext"

const navigation = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { name: "Reports", to: "/reports", icon: BarChart3 },
  { name: "Budgets", to: "/budgets", icon: WalletCards },
  { name: "Settings", to: "/settings", icon: Settings },
]

export default function AppLayout() {
  const { addTransaction, settings, actionLoading, error, clearError } = useApp()
  const { user, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const handleAdd = async (transaction) => addTransaction(transaction)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 bg-white p-6 shadow-sm lg:flex lg:flex-col">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">ExpenseFlow</h1>
            <p className="mt-1 text-xs text-slate-400">Manage your money smarter</p>
          </div>
          <nav className="mt-10 space-y-2">
            {navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${isActive ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={20} />{item.name}</NavLink> })}
          </nav>
          <div className="mt-auto pt-10">
            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-xs text-purple-500">Signed in as</p>
              <p className="mt-1 truncate font-semibold text-purple-900">{settings.name}</p>
              <p className="mt-1 truncate text-xs text-purple-400">{user?.email}</p>
              <button onClick={signOut} className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600"><LogOut size={16} /> Sign out</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-8">
          <div className="p-5 sm:p-6 lg:p-10">
            {error && (
              <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={clearError} aria-label="Dismiss error"><X size={18} /></button>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-purple-600 px-5 py-4 font-semibold text-white shadow-lg hover:bg-purple-700"><Plus size={20} /><span className="hidden sm:inline">Add Transaction</span></button>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around">
          {navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium ${isActive ? "text-purple-600" : "text-slate-500"}`}><Icon size={20} />{item.name}</NavLink> })}
        </div>
      </div>

      <TransactionModal open={showModal} onClose={() => setShowModal(false)} onSave={handleAdd} saving={actionLoading} />
    </div>
  )
}
