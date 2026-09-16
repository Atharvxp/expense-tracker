import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { useApp } from "../context/AppContext"

const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const pad = (value) => String(value).padStart(2, "0")

function getCurrentMonthStart() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
}

function formatMoney(amount, currency) {
  return `${currency}${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

function formatMonth(monthStart) {
  return new Date(`${monthStart}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

export default function Budgets() {
  const { budgets, transactions, settings, addBudget, deleteBudget, actionLoading } = useApp()
  const current = getCurrentMonthStart()
  const [category, setCategory] = useState("Food")
  const [amount, setAmount] = useState("")
  const [monthStart, setMonthStart] = useState(current)
  const [error, setError] = useState("")

  const spendingByCategoryMonth = useMemo(() => {
    const result = {}
    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const key = `${transaction.category}|${transaction.date.slice(0, 7)}`
        result[key] = (result[key] || 0) + transaction.amount
      })
    return result
  }, [transactions])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a budget amount greater than 0.")
      return
    }
    try {
      await addBudget({ category, amount: numericAmount, monthStart })
      setAmount("")
    } catch (err) {
      setError(err?.code === "23505" ? "A budget already exists for this category and month." : err?.message || "Unable to create budget.")
    }
  }

  const changeMonth = (value) => {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(5, 7))
    setMonthStart(`${year}-${pad(month)}-01`)
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-500">Set limits and keep your spending under control.</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Budgets</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Create Budget</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={actionLoading} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Month</label>
              <input type="month" value={monthStart.slice(0, 7)} onChange={(e) => changeMonth(`${e.target.value}-01`)} disabled={actionLoading} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Monthly limit</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" disabled={actionLoading} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={actionLoading} className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60">{actionLoading ? "Saving..." : "Create Budget"}</button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Your Budgets</h3>
          <div className="mt-6 space-y-5">
            {budgets.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">No budgets created yet.</div>
            ) : budgets.map((budget) => {
              const monthKey = budget.monthStart.slice(0, 7)
              const spent = spendingByCategoryMonth[`${budget.category}|${monthKey}`] || 0
              const percentage = Math.min((spent / budget.amount) * 100, 100)
              const overBudget = spent > budget.amount
              return (
                <div key={budget.id} className="rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{budget.category}</p>
                        {overBudget && <span title="Budget exceeded" className="h-2.5 w-2.5 rounded-full bg-red-500" />}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{formatMonth(budget.monthStart)}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatMoney(spent, settings.currency)} / {formatMoney(budget.amount, settings.currency)}</p>
                    </div>
                    <button onClick={() => deleteBudget(budget.id)} disabled={actionLoading} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${overBudget ? "bg-red-500" : "bg-purple-600"}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className={`text-sm ${overBudget ? "font-semibold text-red-600" : "text-slate-500"}`}>{overBudget ? "⚠ Budget exceeded" : `${Math.round(percentage)}% used`}</p>
                    {overBudget && <p className="text-xs font-medium text-red-500">{formatMoney(spent - budget.amount, settings.currency)} over</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
