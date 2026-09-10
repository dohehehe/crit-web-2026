# Supabase schema snapshots

This folder stores auto-generated schema snapshots from the remote Supabase project.

## Commands

```bash
# Verify .env connection
npm run supabase:check

# Pull latest schema once
npm run supabase:schema

# Watch for table/column changes (for local dev + AI context)
npm run supabase:schema:watch
```

Generated files:

- `schema.json` — structured schema for tooling
- `schema.md` — human/AI-readable table reference

Run the watch command in a separate terminal while editing tables in Supabase Studio.
