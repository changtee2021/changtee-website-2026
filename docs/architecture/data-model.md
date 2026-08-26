# Data model / โมเดลข้อมูล

The `changtee_web` schema in Supabase project `pfwygxzwlteqjnnwiwmb` holds the website data.

| Table | Purpose |
|---|---|
| `leads` | Quote, estimate, and contact requests |
| `site_page_views` | Anonymous public-site page / ping / CTA hits for the admin dashboard |
| `portfolio` | Installed-work portfolio content |
| `posts` | Blog and advice articles |
| `reviews` | Customer reviews |
| `estimator_rates` | Product rates and estimator settings |
| `profiles` | Admin/staff profile metadata |

Related operational tables include `lead_events` for status history and `outbound_jobs` for notification work. Admin access should use server-side authorization; service-role database access stays in server code only.
