import { supabase } from "../lib/supabase"

const currencySymbolByCode = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  AED: "د.إ",
  JPY: "¥",
}

export const currencyOptions = Object.entries(currencySymbolByCode).map(
  ([code, symbol]) => ({ code, symbol })
)

export const getCurrencySymbol = (code) =>
  currencySymbolByCode[code] ?? "₹"

const defaultProfile = {
  name: "User",
  currencyCode: "INR",
  currency: "₹",
  theme: "light",
  timezone: "Asia/Kolkata",
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,currency_code,theme,timezone")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error

  if (!data) return defaultProfile

  return {
    name: data.full_name?.trim() || "User",
    currencyCode: data.currency_code,
    currency: getCurrencySymbol(data.currency_code),
    theme: data.theme,
    timezone: data.timezone,
  }
}

export async function updateProfile(userId, changes) {
  const payload = {
    id: userId,
    ...(changes.name !== undefined
      ? { full_name: changes.name.trim() || "User" }
      : {}),
    ...(changes.currencyCode !== undefined
      ? { currency_code: changes.currencyCode }
      : {}),
    ...(changes.theme !== undefined
      ? { theme: changes.theme }
      : {}),
    ...(changes.timezone !== undefined
      ? { timezone: changes.timezone }
      : {}),
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id,full_name,currency_code,theme,timezone")
    .single()

  if (error) throw error

  return {
    name: data.full_name?.trim() || "User",
    currencyCode: data.currency_code,
    currency: getCurrencySymbol(data.currency_code),
    theme: data.theme,
    timezone: data.timezone,
  }
}
