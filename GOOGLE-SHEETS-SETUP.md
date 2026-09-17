# Shadat Fatih — Google Sheets Backend

This version removes the Supabase frontend/backend dependency and uses Google Sheets through a Google Apps Script Web App.

## 1. Apps Script

1. Open the Google Sheet `Shadat Fatih Database`.
2. Extensions → Apps Script.
3. Replace the Apps Script code with `google-apps-script/Code.gs` from this project.
4. In `setAdminCredentials()` replace:
   - `YOUR_ADMIN_EMAIL`
   - `CHANGE_THIS_TO_A_STRONG_PASSWORD`
5. Save.
6. Select `setAdminCredentials` from the function dropdown and Run it once.
7. Approve the Google permissions.
8. Deploy → New deployment → Web app.
9. Execute as: **Me**.
10. Who has access: **Anyone**.
11. Copy the Web app URL ending in `/exec`.

The service account used for the original migration is no longer needed by the website. Apps Script itself accesses the Sheet.

## 2. GitHub Pages

Add a repository secret named:

`VITE_GOOGLE_SCRIPT_URL`

Value: the Apps Script Web App `/exec` URL.

Then push the project to the `main` branch. The GitHub Actions workflow will inject the URL at build time.

## 3. Important

Do not delete the old Supabase project until the new site has been tested in production.

The current Google Sheet already contains the migrated Poems, Stories and Novels. The API also creates `Chapters` and `SiteViews` sheets when needed.

Cover uploads from the admin panel are stored in a Google Drive folder named `Shadat Fatih Covers`.
