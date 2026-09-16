import { supabase } from "../lib/supabase"

const toTransaction = (row) => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  description: row.description,
  date: row.transaction_date,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error("Your session has expired. Please sign in again.")
  return data.user.id
}

export async function listTransactions() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("transactions")
    .select("id,type,amount,category,description,transaction_date,metadata,created_at,updated_at")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(toTransaction)
}

export async function createTransaction(input) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      description: input.description.trim(),
      transaction_date: input.date,
      metadata: input.metadata ?? {},
    })
    .select("id,type,amount,category,description,transaction_date,metadata,created_at,updated_at")
    .single()

  if (error) throw error
  return toTransaction(data)
}

export async function editTransaction(id, input) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("transactions")
    .update({
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      description: input.description.trim(),
      transaction_date: input.date,
      metadata: input.metadata ?? {},
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id,type,amount,category,description,transaction_date,metadata,created_at,updated_at")
    .single()

  if (error) throw error
  return toTransaction(data)
}

export async function removeTransaction(id) {
  const userId = await getUserId()
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}
