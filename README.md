## Demo
https://github.com/user-attachments/assets/602bd55c-917c-45b2-b371-ee60dff9ccc7

## Getting Started

First, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Additional Features

- **Admin Dashboard** and **User Dashboard** for managing rooms, bookings, and user accounts.  
- **Invoice Generation**: Create and export invoices.  
- **Email Notifications**: Powered by Nodemailer.  

## Tech Stack

- **Next.js**  
- **Supabase** with **Drizzle**  
- **shadcn UI**  
- **Tailwind CSS**  

## Environment Variables

Create or update a `.env.local` file to include keys such as:
```bash
NEXT_PUBLIC_SUPABASE_URL="<your-supabase-url>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
PASSWORD="<your-database-password>"
NEXT_PUBLIC_DATABASE_URL="<your-database-url>"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<publishable-key>"
CLERK_SECRET_KEY="<secret-key>"

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_WEBHOOK_SECRET="<your-webhook-secret>"

NEXT_PUBLIC_EMAIL_USR="support@aligarhhostel.com"
NEXT_PUBLIC_EMAIL_PWD="<your-email-password>"

NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"

NODE_ENV="development"
```
Use these variables to connect to Supabase, Clerk, and to manage emails and authentication.

## Learn More

To learn more about Next.js, take a look at:

- [Next.js Documentation](https://nextjs.org/docs)  
- [Learn Next.js](https://nextjs.org/learn)  

Check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) as well.

## Deploy on Vercel

The easiest way to deploy your Next.js app is with [Vercel](https://vercel.com/). See [Next.js deployment](https://nextjs.org/docs/deployment) for more details.
