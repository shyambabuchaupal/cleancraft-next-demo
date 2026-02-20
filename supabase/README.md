# Supabase Configuration

This directory contains all Supabase configuration, migrations, and edge functions for the CleanCraft project.

## 📁 Directory Structure

```
supabase/
├── functions/              # Edge Functions (Deno/TypeScript)
│   ├── send-email.ts      # Email notification handler
│   ├── submit-form.ts     # Form submission processor
│   └── import_map.json    # Dependencies mapping
│
├── migrations/             # Database migrations (SQL)
│   ├── 001_create_tables.sql     # Initial schema
│   └── 002_create_functions.sql  # Database functions
│
├── config.toml            # Supabase CLI configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Supabase CLI installed
- Docker (for local development)

### Install Supabase CLI
```bash
npm install -g supabase
```

### Initialize Local Development
```bash
supabase start
```

### Stop Local Development
```bash
supabase stop
```

## 📋 Migrations

Database migrations are stored in the `migrations/` directory and are automatically applied.

### Create New Migration
```bash
supabase migration new create_new_table
```

### View Migration Status
```bash
supabase migration list
```

### Apply Migrations
```bash
supabase migration up
```

## ⚡ Edge Functions

Edge Functions are serverless functions that run on Supabase's infrastructure.

### Functions Overview

#### 1. **send-email.ts**
Sends email notifications

**Triggers:**
- Form submission notifications
- Order confirmations
- Admin alerts

**Input:**
```json
{
  "to": "user@example.com",
  "subject": "Subject",
  "message": "Email body",
  "template": "template_name"
}
```

#### 2. **submit-form.ts**
Handles form submissions from the client

**Input:**
```json
{
  "form_type": "franchise|course|contact",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Optional message"
}
```

### Deploy Edge Functions
```bash
supabase functions deploy send-email
supabase functions deploy submit-form
```

### Test Edge Function Locally
```bash
supabase functions serve
```

### Invoke Edge Function
```bash
curl -i --location --request POST http://localhost:54321/functions/v1/submit-form \
  --header 'Authorization: Bearer eyJhbGc...' \
  --header 'Content-Type: application/json' \
  --data '{"form_type":"franchise","name":"John","email":"john@example.com","phone":"123456"}'
```

## 🔐 Environment Variables

Required environment variables for edge functions:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Set in Supabase dashboard → Functions → Secrets

## 📊 Database Schema

### Tables

#### users
- `id` (UUID)
- `email` (VARCHAR, unique)
- `full_name` (VARCHAR)
- `phone` (VARCHAR)
- `role` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### franchise_submissions
- `id` (UUID)
- `name`, `email`, `phone` (VARCHAR)
- `location`, `investment_range` (VARCHAR)
- `message` (TEXT)
- `submitted_at` (TIMESTAMP)
- `status` (VARCHAR)
- `assigned_to` (UUID - FK to users)

#### course_submissions
- `id` (UUID)
- `name`, `email`, `phone` (VARCHAR)
- `course_id`, `course_name` (VARCHAR)
- `submitted_at` (TIMESTAMP)
- `status`, `payment_status` (VARCHAR)

#### contact_submissions
- `id` (UUID)
- `name`, `email`, `phone` (VARCHAR)
- `subject`, `message` (VARCHAR/TEXT)
- `submitted_at` (TIMESTAMP)
- `status`, `priority` (VARCHAR)

#### emails
- `id` (UUID)
- `recipient`, `subject` (VARCHAR)
- `body`, `template_name` (TEXT/VARCHAR)
- `status` (VARCHAR)
- `created_at`, `sent_at` (TIMESTAMP)
- `error_message` (TEXT)

## 🔍 Database Functions

### get_submission_stats()
Get statistics for submissions from last 30 days

```sql
SELECT * FROM get_submission_stats(NOW() - INTERVAL '7 days');
```

### get_recent_submissions()
Get recent unprocessed submissions

```sql
SELECT * FROM get_recent_submissions(20);
```

### validate_email()
Validate email format

```sql
SELECT validate_email('user@example.com');
```

## 🛡️ Row Level Security (RLS)

RLS is enabled on all tables. Policies allow:
- Public inserts (for form submissions)
- Authenticated reads (for admin/dashboard)

### Disable RLS for Development
```sql
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
```

## 📈 Monitoring

### View Function Logs
```bash
supabase functions list
supabase functions logs send-email
```

### Check Function Invocations
In Supabase dashboard → Functions → Metrics

## 🔗 Integration with Next.js

### In your Next.js Application

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Call edge function
const { data, error } = await supabase.functions.invoke('submit-form', {
  body: {
    form_type: 'franchise',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456',
  },
});
```

## 🐛 Troubleshooting

### Function Not Found
```bash
supabase functions list  # Verify function is deployed
supabase functions deploy function-name
```

### Database Connection Issues
```bash
supabase start  # Restart local development
supabase db reset  # Reset database
```

### Migration Conflicts
```bash
supabase migration repair  # Fix migration history
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

When adding new features:
1. Create a new migration for schema changes
2. Add edge functions for API endpoints
3. Update RLS policies if needed
4. Test locally before deployment
5. Update this README with new functions/tables

---

**Last Updated:** February 2026
