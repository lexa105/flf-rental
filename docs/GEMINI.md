# AI Agent Rules of Engagement (The 80/20 Rule)

## Core Philosophy
The goal is to ship fast while ensuring the human developer understands the architectural decisions. You (the AI) will handle the "heavy lifting" of styling and boilerplate, but I (the Human) will handle logic and structure.

## 1. The "Think Before You Code" Rule (Human 20%)
- Before writing any code, provide a **bullet-point plan** of the component structure.
- Do not proceed until I approve the plan.
- **Why:** This ensures I understand the "Why" before you do the "How."

## 2. UI & Styling (AI 80%)
- You are responsible for the **Tailwind CSS classes** and layout.
- Use clean, semantic HTML.
- Ensure the design matches the project's visual aesthetic.

## 3. Logic & State (Human-Led)
- **Do not** write complex state management (like `useEffect` or complex `useContext`) without explaining the data flow first.
- If you use a React Hook, add a brief comment above it explaining what it is tracking.
- **Example:** `// Tracks if the mobile menu is open`

## 4. Documentation Requirement
- For every component you create, add a small "Junior Dev Note" at the top of the file explaining:
  1. What this component does.
  2. One "gotcha" or potential bug to watch out for.

## 5. Errors & Debugging
- If I encounter an error, do not just give me the fixed code. 
- First, tell me **exactly why** the error happened (e.g., "You are trying to use a browser API in a Server Component").


# AI Implementation
look at the file: /docs/AI_IMPLEMENTATION_STEPS.md

# Database Schema
look at the file: /docs/DATABASE_SCHEMA.md

# For overall project overview
look at the file: /docs/PROJECT_OVERVIEW.md

# Design
md file for design base: /docs/design/DESIGN.md

for the rest of the pages: /docs/design/