# IdeaToStartup Dashboard

A comprehensive platform for entrepreneurs to analyze business ideas, generate pitch decks, and manage their startup journey.

## 🚀 Features

- **Business Idea Analysis** - AI-powered analysis of your business concepts
- **Pitch Deck Generation** - Create professional pitch decks automatically
- **Market Insights** - Comprehensive market research and competitor analysis
- **User Authentication** - Secure login powered by Clerk with email/password and Google OAuth
- **Database Integration** - Persistent user data with Supabase

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm
- **AI Integration**: OpenAI, Deepseek, Google Gemini
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ideatostartup_dashboard
   \`\`\`

2. **Install dependencies with pnpm**
   \`\`\`bash
   # Install pnpm globally if you haven't already
   npm install -g pnpm
   
   # Install project dependencies
   pnpm install

   # If you see ERR_PNPM_TARBALL_INTEGRITY warnings during installation,
   # clear pnpm's local store and reinstall
   pnpm store prune && pnpm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file and add your Clerk credentials:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   ```

4. **Configure additional environment variables**
   
   Add these to your `.env.local` file:
   \`\`\`env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # AI APIs
   OPENAI_API_KEY=your_openai_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
   \`\`\`

5. **Set up the database**

   Ensure your `.env.local` includes `SUPABASE_DB_URL`, the Postgres connection string provided by Supabase. Then run:

   ```bash
   pnpm setup-db
   ```

   This creates a `user_interactions` table used to store history for each user.

6. **Start the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

## 🔧 Development Commands

\`\`\`bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
\`\`\`

## ❗ Troubleshooting

If you see a `ChunkLoadError` while running the development server:

1. Stop the server with <kbd>Ctrl+C</kbd>.
2. Remove the `.next` directory to clear stale caches:
   ```bash
   rm -rf .next
   ```
3. Ensure all dependencies are installed:
   ```bash
   pnpm install
   ```
4. Restart the server:
   ```bash
   pnpm dev
   ```

A missing or outdated build often causes this error, and cleaning the cache usually resolves it.
### Build fails due to out-of-memory errors
If the build stops with `Next.js build worker exited with code: null and signal: SIGBUS` or you see warnings about "Serializing big strings", increase Node's heap size:
```bash
NODE_OPTIONS=--max_old_space_size=4096 pnpm build
```
This allocates about 4 GB of RAM for the build process. Adjust as needed.

### ERR_PNPM_TARBALL_INTEGRITY during installation
If `pnpm install` fails with warnings about `ERR_PNPM_TARBALL_INTEGRITY`,
packages may have been republished and the cached checksums no longer match.
Clear pnpm's local store and reinstall:
```bash
pnpm store prune
pnpm install
```

## 🔐 Authentication Setup

Clerk handles authentication for this project. Ensure you have created an application in the Clerk dashboard and configured the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

Refer to the [Clerk documentation](https://clerk.com/docs) for setting up OAuth providers like Google.

The app exposes `/sign-in` and `/sign-up` routes that render Clerk's authentication components. Use these pages when signing in or creating an account.


## 🗄️ Database Schema

The application uses Supabase with the following tables:

- **users** - User profiles and authentication data
- **user_sessions** - Session management
- **accounts** - OAuth provider account linking

## 🚀 Deployment

### Vercel Deployment
1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy**
   \`\`\`bash
   vercel deploy
   \`\`\`

### Environment Variables for Production
Make sure to set all environment variables in your Vercel project settings:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- All AI API keys

## 📱 Usage

1. **Sign Up/Sign In** - Create an account or sign in with Google
2. **Analyze Ideas** - Use the business idea analyzer to evaluate concepts
3. **Generate Pitches** - Create professional pitch decks
4. **Explore Market** - Research market insights and competitors
5. **Track Progress** - Monitor your startup journey

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [documentation](./docs)
2. Search existing [issues](./issues)
3. Create a new issue with detailed information

---

Built with ❤️ for entrepreneurs and startup founders.

