import { useEffect, useState } from "react"
import { X } from "lucide-react"

const categories = {
  expense: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"],
  income: ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"],
}

function getToday() {
  return new Date().toISOString().split("T")[0]
}

export default function TransactionModal({
  open,
  onClose,
  onSave,
  transaction = null,
  saving = false,
}) {
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Food")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(getToday())
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategory(transaction.category)
      setDescription(transaction.description)
      setDate(transaction.date)
    } else {
      setType("expense")
      setAmount("")
      setCategory("Food")
      setDescription("")
      setDate(getToday())
    }
    setError("")
  }, [open, transaction])

  useEffect(() => {
    const validCategories = categories[type]
    if (!validCategories.includes(category)) setCategory(validCategories[0])
  }, [type, category])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter an amount greater than ₹0.")
      return
    }
    if (!description.trim()) {
      setError("Please enter a description.")
      return
    }
    if (!date) {
      setError("Please select a date.")
      return
    }

    try {
      await onSave({
        type,
        amount: numericAmount,
        category,
        description: description.trim(),
        date,
      })
      onClose()
    } catch (err) {
      setError(err?.message || "Unable to save the transaction.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {transaction ? "Update your transaction details." : "Record income or an expense."}
            </p>
          </div>
          <button onClick={onClose} disabled={saving} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setType("expense")} disabled={saving} className={`rounded-xl border px-4 py-3 font-medium transition ${type === "expense" ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 text-slate-600"}`}>Expense</button>
              <button type="button" onClick={() => setType("income")} disabled={saving} className={`rounded-xl border px-4 py-3 font-medium transition ${type === "income" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-600"}`}>Income</button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500">
              {categories[type].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this transaction for?" disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving..." : transaction ? "Update Transaction" : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
