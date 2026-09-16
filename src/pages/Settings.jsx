import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function Settings() {
  const { settings, updateSettings, actionLoading } = useApp()

  const [name, setName] = useState(settings.name)

  const handleSave = async (event) => {
    event.preventDefault()
    await updateSettings({ name: name.trim() || "User" })
  }



  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Customize your ExpenseFlow experience.
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Settings
        </h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Profile
          </h3>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Display name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              {actionLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Preferences
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Currency
              </label>

              <select
                value={settings.currencyCode}
                onChange={(event) =>
                  updateSettings({
                    currencyCode: event.target.value,
                  })
                }
                disabled={actionLoading}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="AUD">Australian Dollar (A$)</option>
                <option value="CAD">Canadian Dollar (C$)</option>
                <option value="SGD">Singapore Dollar (S$)</option>
                <option value="AED">UAE Dirham (د.إ)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Theme
              </label>

              <select
                value={settings.theme}
                onChange={(event) =>
                  updateSettings({ theme: event.target.value })
                }
                disabled={actionLoading}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </section>


      </div>
    </>
  )
}