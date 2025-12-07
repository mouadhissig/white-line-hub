# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fb159570-3f73-464b-a403-fb740ca87ee3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fb159570-3f73-464b-a403-fb740ca87ee3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Contact Form Email Configuration

This project includes a serverless contact form that sends emails via SMTP using Netlify Functions.

### Environment Variables

To enable the contact form email functionality, you need to configure the following environment variables in your Netlify dashboard (Site settings > Environment variables):

- `SMTP_HOST` - Your SMTP server hostname
- `SMTP_PORT` - SMTP server port (typically `587` for TLS or `465` for SSL)
- `SMTP_SECURE` - Set to `true` for SSL, `false` for TLS
- `SMTP_USER` - Your SMTP username/email address
- `SMTP_PASS` - Your SMTP password or app-specific password

**Configuration for Zoho Mail (contact@whitelineissig.me):**
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@whitelineissig.me
SMTP_PASS=your-zoho-password
```

**Note:** Use your regular Zoho Mail password, or for enhanced security, create an [App-Specific Password](https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html) in Zoho Mail settings.

### Testing Locally

To test the contact form locally with Netlify CLI:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create a `.env` file in the project root with your SMTP configuration
3. Run: `netlify dev`
4. The contact form will be available at `http://localhost:8888`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fb159570-3f73-464b-a403-fb740ca87ee3) and click on Share -> Publish.

Alternatively, you can deploy directly to Netlify:
1. Connect your GitHub repository to Netlify
2. Configure the environment variables in Netlify dashboard
3. Deploy!

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
