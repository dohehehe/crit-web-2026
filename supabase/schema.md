# Supabase Schema

> Auto-generated. Run `npm run supabase:schema` to refresh.

- Updated: 2026-09-09T07:30:56.946Z
- Tables: 12

## `authors`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `name` | text | no |  |  |
| `slug` | text | no |  |  |

## `categories`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `is_active` | boolean | no |  |  |
| `name` | text | no |  |  |
| `section_id` | uuid | no | gen_random_uuid() | FK → sections.id |
| `slug` | text | no |  |  |
| `sort_order` | numeric | no |  |  |
| `updated_at` | timestamp with time zone | no |  |  |

## `info`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `content` | jsonb | no |  |  |
| `created_at` | timestamp with time zone | yes | now() |  |
| `email` | text | no |  |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `insta` | text | no |  |  |
| `youtube` | text | no |  |  |

## `issues`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `cover_img` | text | no |  |  |
| `created_at` | timestamp with time zone | yes | now() |  |
| `description` | jsonb | no |  |  |
| `file_url` | text | no |  |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `issue_number` | text | no |  |  |
| `slug` | text | no |  |  |
| `title` | text | no |  |  |

## `keywords`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `name` | text | no |  |  |
| `slug` | text | no |  |  |

## `notice`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `content` | jsonb | no |  |  |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `is_active` | boolean | no |  |  |
| `title` | text | no |  |  |

## `notice_popup`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `content` | jsonb | no |  |  |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `is_active` | boolean | no |  |  |
| `link_url` | text | no |  |  |

## `post_keywords`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `keyword_id` | uuid | no | gen_random_uuid() | FK → keywords.id |
| `post_id` | uuid | no | gen_random_uuid() | FK → posts.id |

## `posts`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `author_id` | uuid | no | gen_random_uuid() | FK → authors.id |
| `category_id` | uuid | no | gen_random_uuid() | FK → categories.id |
| `content` | jsonb | no |  |  |
| `created_at` | timestamp with time zone | yes | now() |  |
| `end_at` | timestamp with time zone | no |  |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `is_active` | boolean | no |  |  |
| `issue_id` | uuid | no | gen_random_uuid() | FK → issues.id |
| `slug` | text | no |  |  |
| `start_at` | timestamp with time zone | no |  |  |
| `subtitle` | text | no |  |  |
| `thumnail_img` | text | no |  |  |
| `title` | text | no |  |  |
| `updated_at` | timestamp with time zone | no |  |  |
| `video_url` | text | no |  |  |
| `workshop_url` | text | no |  |  |

## `roles`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `name` | text | no |  |  |

## `sections`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `is_active` | boolean | no |  |  |
| `name` | text | no |  |  |
| `slug` | text | no |  |  |
| `sort_order` | numeric | no |  |  |
| `updated_at` | timestamp with time zone | no |  |  |

## `users`

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamp with time zone | yes | now() |  |
| `email` | text | no |  |  |
| `id` | uuid | yes | gen_random_uuid() | PK |
| `name` | text | yes |  |  |
| `role_id` | uuid | no | gen_random_uuid() | FK → roles.id |

