# Customization Rules

- **Git Pushes**: Do not automatically execute any `git push` commands. Only push to Git repository remotes when the user explicitly instructs you to do so in a message.
- **Git Commits & Pulls**: Do not automatically run `git commit` commands; keep modifications unstaged/uncommitted so the user's friend can commit them. When pulling code, always use `git pull origin main --rebase` to prevent merge commits.
- **Language Rule for Mindmaps**: Only mindmaps for the English subject ("Tiếng Anh") are allowed to contain English terms, text, or examples. All mindmaps and AI responses for all other subjects (Math, Physics, Chemistry, Literature, History, Geography, etc.) MUST strictly use 100% Vietnamese for all node titles ("name"), descriptions ("description"), and explanations.
