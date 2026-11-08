# To-Do List (React + Vite)

A simple to-do app built with JavaScript and React.

## Features

- Add, complete, edit (double-click or Edit button) and delete tasks
- Filter by All / Active / Completed
- Mark all done, clear completed
- Remaining-task counter
- Saved automatically in the browser (localStorage)

## Run it

Requires Node.js 18+.

```bash
cd todo-app
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

Build for production with `npm run build`.

## Structure

```
todo-app/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx      entry point
    App.jsx       state, filtering, persistence
    TodoItem.jsx  single task row with inline editing
    App.css       styles
```
