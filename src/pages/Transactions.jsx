import { useMemo, useState } from "react"
import { Pencil, Search, Trash2 } from "lucide-react"
import TransactionModal from "../components/TransactionModal"
import { useApp } from "../context/AppContext"

const monthOptions = [
  ["All months", ""],
  ["January", "01"],
  ["February", "02"],
  ["March", "03"],
  ["April", "04"],
  ["May", "05"],
  ["June", "06"],
  ["July", "07"],
  ["August", "08"],
  ["September", "09"],
  ["October", "10"],
  ["November", "11"],
  ["December", "12"],
]

function formatMoney(amount, currency) {
  return `${currency}${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

export default function Transactions() {
  const {
    transactions,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    actionLoading,
  } = useApp()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" })
  const [monthFilter, setMonthFilter] = useState(currentMonth)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState(null)

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        if (typeFilter === "all") return true

        return transaction.type === typeFilter
      })
      .filter((transaction) => {
        if (monthFilter === "All months") return true

        return transaction.date.slice(5, 7) === (monthOptions.find(([label]) => label === monthFilter)?.[1] ?? "")
      })
      .filter((transaction) => {
        const value = search.toLowerCase()

        return (
          transaction.category.toLowerCase().includes(value) ||
          transaction.description
            .toLowerCase()
            .includes(value)
        )
      })
  }, [
    transactions,
    search,
    typeFilter,
    monthFilter,
  ])

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this transaction?")
    if (!confirmed) return
    try {
      await deleteTransaction(id)
    } catch {
      // AppContext exposes the error banner.
    }
  }

  const handleSave = async (transaction) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transaction)
    } else {
      await addTransaction(transaction)
    }
    setEditingTransaction(null)
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Manage every transaction in one place.
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Transactions
        </h2>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            {monthOptions.map(([label, value]) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-400">
              No transactions found.
            </div>
          ) : (
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-400">
                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {transaction.date}
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-900">
                      {transaction.category}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {transaction.description}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.type === "income"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-4 text-right font-semibold ${
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
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleEdit(transaction)
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(transaction.id)
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TransactionModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTransaction(null)
        }}
        onSave={handleSave}
        transaction={editingTransaction}
        saving={actionLoading}
      />
    </>
  )
}