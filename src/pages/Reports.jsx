import { useMemo } from "react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts"
import { useApp } from "../context/AppContext"

function formatMoney(amount, currency) {
  return `${currency}${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

export default function Reports() {
  const { transactions, settings } = useApp()

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const categoryData = useMemo(() => {
    const grouped = {}

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        grouped[transaction.category] =
          (grouped[transaction.category] || 0) +
          transaction.amount
      })

    return Object.entries(grouped).map(
      ([name, value]) => ({
        name,
        value,
      })
    )
  }, [transactions])

  const monthlyData = useMemo(() => {
    const grouped = {}

    transactions.forEach((transaction) => {
      const month = transaction.date.slice(0, 7)

      if (!grouped[month]) {
        grouped[month] = {
          month,
          income: 0,
          expenses: 0,
        }
      }

      grouped[month][
        transaction.type === "income"
          ? "income"
          : "expenses"
      ] += transaction.amount
    })

    return Object.values(grouped).sort((a, b) =>
      a.month.localeCompare(b.month)
    )
  }, [transactions])

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Understand where your money is going.
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Reports
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Income
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-600">
            {formatMoney(income, settings.currency)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Expenses
          </p>

          <p className="mt-3 text-3xl font-bold text-red-500">
            {formatMoney(expenses, settings.currency)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Net
          </p>

          <p className="mt-3 text-3xl font-bold text-purple-600">
            {formatMoney(
              income - expenses,
              settings.currency
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Spending by Category
          </h3>

          {categoryData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No expense data yet.
            </div>
          ) : (
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          [
                            "#7c3aed",
                            "#ec4899",
                            "#f59e0b",
                            "#10b981",
                            "#3b82f6",
                            "#ef4444",
                            "#64748b",
                          ][index %
                            7]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Income vs Expenses
          </h3>

          {monthlyData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No transaction data yet.
            </div>
          ) : (
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="income"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="expenses"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </>
  )
}