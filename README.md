# ExpenseFlow

ExpenseFlow is a portfolio-focused personal finance dashboard built with React, Vite, Tailwind CSS, Recharts, and Supabase.

## Features

- Supabase email authentication
- Protected routes and persistent sessions
- User-isolated transactions with Row Level Security
- Add, edit, and delete income/expense transactions
- Monthly budgets with over-budget warnings
- Spending and income reports
- Profile, currency, and theme preferences
- Responsive desktop/mobile layout

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Recharts
- Supabase Auth + PostgreSQL + RLS

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and publishable key.
5. Run `npm install`.
6. Run `npm run dev`.

Never expose a Supabase service-role key in the frontend.
