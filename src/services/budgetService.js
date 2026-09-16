import { supabase } from "../lib/supabase"

const toBudget = (row) => ({
  id: row.id,
  category: row.category,
  amount: Number(row.amount),
  monthStart: row.month_start,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error("Your session has expired. Please sign in again.")
  return data.user.id
}

export async function listBudgets() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("budgets")
    .select("id,category,amount,month_start,created_at,updated_at")
    .eq("user_id", userId)
    .order("month_start", { ascending: false })
    .order("category", { ascending: true })

  if (error) throw error
  return (data ?? []).map(toBudget)
}

export async function createBudget({ category, amount, monthStart }) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category,
      amount: Number(amount),
      month_start: monthStart,
    })
    .select("id,category,amount,month_start,created_at,updated_at")
    .single()

  if (error) throw error
  return toBudget(data)
}

export async function removeBudget(id) {
  const userId = await getUserId()
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}
