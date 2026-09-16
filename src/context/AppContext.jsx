import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useAuth } from "../auth/AuthContext"
import {
  createTransaction,
  editTransaction,
  listTransactions,
  removeTransaction,
} from "../services/transactionService"
import {
  createBudget,
  listBudgets,
  removeBudget,
} from "../services/budgetService"
import {
  getProfile,
  updateProfile,
  getCurrencySymbol,
} from "../services/profileService"

const AppContext = createContext(null)

const defaultSettings = {
  name: "User",
  currencyCode: "INR",
  currency: "₹",
  theme: "light",
  timezone: "Asia/Kolkata",
}

export function AppProvider({ children }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setBudgets([])
      setSettings(defaultSettings)
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const [nextTransactions, nextBudgets, profile] = await Promise.all([
        listTransactions(),
        listBudgets(),
        getProfile(user.id),
      ])

      setTransactions(nextTransactions)
      setBudgets(nextBudgets)
      setSettings(profile)
    } catch (err) {
      console.error("Failed to load ExpenseFlow data:", err)
      setError(err?.message || "Unable to load your data.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setTransactions([])
      setBudgets([])
      setSettings(defaultSettings)
      setLoading(false)
      return
    }
    loadData()
  }, [authLoading, isAuthenticated, loadData])

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark"
    )
  }, [settings.theme])

  const runAction = useCallback(async (action) => {
    setActionLoading(true)
    setError("")
    try {
      return await action()
    } catch (err) {
      console.error("ExpenseFlow action failed:", err)
      setError(err?.message || "Something went wrong.")
      throw err
    } finally {
      setActionLoading(false)
    }
  }, [])

  const addTransaction = useCallback(
    async (transaction) => {
      const created = await runAction(() => createTransaction(transaction))
      setTransactions((current) => [created, ...current])
      return created
    },
    [runAction]
  )

  const updateTransaction = useCallback(
    async (id, transaction) => {
      const updated = await runAction(() => editTransaction(id, transaction))
      setTransactions((current) =>
        current.map((item) => (item.id === id ? updated : item))
      )
      return updated
    },
    [runAction]
  )

  const deleteTransaction = useCallback(
    async (id) => {
      await runAction(() => removeTransaction(id))
      setTransactions((current) => current.filter((item) => item.id !== id))
    },
    [runAction]
  )

  const addBudget = useCallback(
    async (budget) => {
      const created = await runAction(() => createBudget(budget))
      setBudgets((current) => [created, ...current])
      return created
    },
    [runAction]
  )

  const deleteBudget = useCallback(
    async (id) => {
      await runAction(() => removeBudget(id))
      setBudgets((current) => current.filter((item) => item.id !== id))
    },
    [runAction]
  )

  const updateSettings = useCallback(
    async (changes) => {
      if (!user) return
      const next = await runAction(() => updateProfile(user.id, changes))
      setSettings(next)
      return next
    },
    [runAction, user]
  )

  const resetLocalData = useCallback(() => {
    // Kept as a compatibility method for existing UI code.
    // The application no longer stores financial data in localStorage.
    setTransactions([])
    setBudgets([])
  }, [])

  const clearError = useCallback(() => setError(""), [])

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      settings,
      loading,
      actionLoading,
      error,
      clearError,
      refreshData: loadData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      deleteBudget,
      updateSettings,
      resetLocalData,
      currencySymbol: getCurrencySymbol(settings.currencyCode),
    }),
    [
      transactions,
      budgets,
      settings,
      loading,
      actionLoading,
      error,
      clearError,
      loadData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      deleteBudget,
      updateSettings,
      resetLocalData,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used inside AppProvider")
  return context
}
