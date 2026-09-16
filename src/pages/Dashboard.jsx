import { useMemo, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"

const months = [
  "All months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const monthMap = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
}

function formatMoney(amount, currency) {
  return `${currency}${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

export default function Dashboard() {
  const { transactions, settings } = useApp()

  const currentMonth = new Date().toLocaleString("en-US", { month: "long" })
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "All months") {
      return transactions
    }

    const month = monthMap[selectedMonth]

    return transactions.filter(
      (transaction) => transaction.date.slice(5, 7) === month
    )
  }, [transactions, selectedMonth])

  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const balance = totalIncome - totalExpenses

  const chartData = useMemo(() => {
    const grouped = {}

    filteredTransactions.forEach((transaction) => {
      const day = transaction.date.slice(5)

      if (!grouped[day]) {
        grouped[day] = {
          date: day,
          income: 0,
          expenses: 0,
        }
      }

      if (transaction.type === "income") {
        grouped[day].income += transaction.amount
      } else {
        grouped[day].expenses += transaction.amount
      }
    })

    return Object.values(grouped).sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  }, [filteredTransactions])

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Welcome back 👋
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard
          </h2>
        </div>

        <select
          value={selectedMonth}
          onChange={(event) =>
            setSelectedMonth(event.target.value)
          }
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-600 shadow-sm outline-none xl:w-auto"
        >
          {months.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-purple-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-100">
              Total Balance
            </p>
            <Wallet size={22} />
          </div>

          <h3 className="mt-4 text-3xl font-bold">
            {formatMoney(balance, settings.currency)}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <ArrowDownLeft size={20} />
            <p className="text-sm font-medium">
              Total Income
            </p>
          </div>

          <h3 className="mt-4 text-3xl font-bold text-slate-900">
            {formatMoney(totalIncome, settings.currency)}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-500">
            <ArrowUpRight size={20} />
            <p className="text-sm font-medium">
              Total Expenses
            </p>
          </div>

          <h3 className="mt-4 text-3xl font-bold text-slate-900">
            {formatMoney(totalExpenses, settings.currency)}
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Spending Overview
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Income and expenses over time
              </p>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="mt-6 flex h-72 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400">
              Add transactions to see your chart.
            </div>
          ) : (
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#16a34a"
                    fill="#dcfce7"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    fill="#fee2e2"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Recent Transactions
            </h3>

            <Link
              to="/transactions"
              className="text-sm font-semibold text-purple-600"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                No transactions for this period.
              </div>
            ) : (
              filteredTransactions
                .slice(0, 5)
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {transaction.category}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {transaction.description}
                      </p>
                    </div>

                    <p
                      className={`ml-4 shrink-0 font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      {formatMoney(
                        transaction.amount,
                        settings.currency
                      )}
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}