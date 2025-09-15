# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




Steps to push to the github 
# 1. Go to project root
cd D:\SwiftSuggest\client\..   # adjust if your .git is one level up

# 2. Confirm repo & view changes
git status

# 3. Stage everything (or cherry-pick files instead)
git add .

# 4. Commit (edit message as needed)
git commit -m "feat: work done on $(Get-Date -Format 'yyyy-MM-dd') – navbar fix & assets import"

# 5. Check remote (should show your GitHub URL)
git remote -v

# (If remote not set, add it — replace URL with your repo)
# git remote add origin https://github.com/PAVAN-DEVMURARI/QuickAI---AI-SaaS-App.git

# 6. Push to existing main branch
git push origin main

# (If main doesn't exist remotely yet)
# git push -u origin main

# Optional: Push a feature branch instead
# git checkout -b feat/navbar-fix
# git push -u origin feat/navbar-fix