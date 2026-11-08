import { useEffect, useMemo, useState } from "react";
import TodoItem from "./TodoItem.jsx";
import DateField from "./DateField.jsx";
import Scene from "./Scene.jsx";
import {
  addDays,
  formatDMY,
  formatLong,
  formatShort,
  parseISO,
  relativeLabel,
  startOfWeek,
  todayISO,
  weekdayLong,
  weekdayShort,
} from "./dateUtils.js";

const STORAGE_KEY = "todos-v1";

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.done,
  completed: (todo) => todo.done,
};

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    const today = todayISO();
    // Tasks saved before dates existed get today's date
    return saved.map((t) => ({ ...t, date: t.date || today, time: t.time || "" }));
  } catch {
    return [];
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Earlier date first; within a day, timed tasks by time, untimed tasks last
function compareTodos(a, b) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.time !== b.time) {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time < b.time ? -1 : 1;
  }
  return 0;
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [view, setView] = useState("day"); // "day" | "all"
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // storage unavailable - app still works in memory
    }
  }, [todos]);

  const today = todayISO();

  const selectDay = (iso) => {
    if (iso) setSelectedDate(iso);
  };

  const addTodo = (e) => {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;
    setTodos((prev) => [
      ...prev,
      { id: makeId(), title, done: false, date: selectedDate, time },
    ]);
    setText("");
    setTime("");
  };

  const toggleTodo = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const deleteTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const editTodo = (id, changes) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  // Tasks in the current view (selected day, or everything)
  const scoped = useMemo(
    () => (view === "day" ? todos.filter((t) => t.date === selectedDate) : todos),
    [todos, view, selectedDate]
  );

  const visible = useMemo(
    () => scoped.filter(FILTERS[filter]).sort(compareTodos),
    [scoped, filter]
  );

  const pendingByDate = useMemo(() => {
    const map = {};
    for (const t of todos) if (!t.done) map[t.date] = (map[t.date] || 0) + 1;
    return map;
  }, [todos]);

  const toggleAll = () => {
    const ids = new Set(scoped.map((t) => t.id));
    const allDone = scoped.every((t) => t.done);
    setTodos((prev) =>
      prev.map((t) => (ids.has(t.id) ? { ...t, done: !allDone } : t))
    );
  };

  const clearCompleted = () => {
    const ids = new Set(scoped.filter((t) => t.done).map((t) => t.id));
    setTodos((prev) => prev.filter((t) => !ids.has(t.id)));
  };

  const remaining = scoped.filter((t) => !t.done).length;
  const completedCount = scoped.length - remaining;

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group the visible tasks by date for the "All dates" view
  const groups = [];
  if (view === "all") {
    for (const t of visible) {
      const last = groups[groups.length - 1];
      if (last && last.date === t.date) last.items.push(t);
      else groups.push({ date: t.date, items: [t] });
    }
  }

  const renderItems = (items) =>
    items.map((todo) => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />
    ));

  const dayLabel = relativeLabel(selectedDate);
  const dayNumber = parseISO(selectedDate).getDate();

  return (
    <>
      <Scene />

      <main className="app">
        <header className="hero">
          {/* keyed on the date so the sign flickers on again whenever the day changes */}
          <div className="numeral-wrap" key={selectedDate}>
            <span className="numeral" aria-hidden="true">
              {dayNumber}
            </span>
          </div>
          <div className="hero-text">
            <h1 aria-label={formatLong(selectedDate)}>{weekdayLong(selectedDate)}</h1>
            <p>{formatDMY(selectedDate)}</p>
            {dayLabel && <span className="badge">{dayLabel}</span>}
          </div>
        </header>

        <section className="panel">
          <div className="week">
            <button
              className="nav"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              aria-label="Previous week"
            >
              ‹
            </button>
            <div className="days">
              {weekDays.map((d) => (
                <button
                  key={d}
                  className={
                    "day" +
                    (d === selectedDate && view === "day" ? " selected" : "") +
                    (d === today ? " today" : "")
                  }
                  onClick={() => {
                    setSelectedDate(d);
                    setView("day");
                  }}
                  aria-label={formatLong(d)}
                >
                  <span className="dow">{weekdayShort(d)}</span>
                  <span className="dom">{parseISO(d).getDate()}</span>
                  {pendingByDate[d] ? (
                    <span className="count">{pendingByDate[d]}</span>
                  ) : null}
                </button>
              ))}
            </div>
            <button
              className="nav"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              aria-label="Next week"
            >
              ›
            </button>
          </div>

          <div className="view-row">
            <div className="segmented" role="group" aria-label="View">
              <button
                className={view === "day" ? "active" : ""}
                onClick={() => setView("day")}
              >
                Day
              </button>
              <button
                className={view === "all" ? "active" : ""}
                onClick={() => setView("all")}
              >
                All dates
              </button>
            </div>
            <button
              className="link"
              onClick={() => {
                setSelectedDate(today);
                setView("day");
              }}
            >
              Jump to today
            </button>
          </div>

          <form className="add-form" onSubmit={addTodo}>
            <input
              type="text"
              className="add-title"
              placeholder={`Add a task for ${formatShort(selectedDate)}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="New task"
              autoFocus
            />
            <div className="add-row">
              <div className="field">
                <label htmlFor="new-date">Date</label>
                <DateField id="new-date" value={selectedDate} onChange={selectDay} />
              </div>
              <label>
                <span>Time (optional)</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
              <button type="submit">Add task</button>
            </div>
          </form>

          {scoped.length > 0 && (
            <div className="toolbar">
              <button className="link" onClick={toggleAll}>
                {remaining === 0 ? "Mark all active" : "Mark all done"}
              </button>
              <div className="filters" role="group" aria-label="Filter tasks">
                {Object.keys(FILTERS).map((name) => (
                  <button
                    key={name}
                    className={filter === name ? "active" : ""}
                    onClick={() => setFilter(name)}
                  >
                    {name[0].toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "day" ? (
            <ul className="todo-list">{renderItems(visible)}</ul>
          ) : (
            groups.map((group) => {
              const rel = relativeLabel(group.date);
              const overdue =
                group.date < today && group.items.some((t) => !t.done);
              return (
                <section key={group.date} className="group">
                  <h3 className="group-heading">
                    {rel && <span className="badge">{rel}</span>}
                    {formatLong(group.date)}
                    {overdue && <span className="badge overdue">Overdue</span>}
                  </h3>
                  <ul className="todo-list">{renderItems(group.items)}</ul>
                </section>
              );
            })
          )}

          {scoped.length === 0 && (
            <p className="empty">
              {view === "day"
                ? `No tasks on ${formatShort(selectedDate)}. Add one above.`
                : "Nothing here yet. Add your first task above."}
            </p>
          )}
          {scoped.length > 0 && visible.length === 0 && (
            <p className="empty">No {filter} tasks.</p>
          )}

          {scoped.length > 0 && (
            <footer>
              <span>
                {remaining} {remaining === 1 ? "task" : "tasks"} left
              </span>
              {completedCount > 0 && (
                <button className="link" onClick={clearCompleted}>
                  Clear completed ({completedCount})
                </button>
              )}
            </footer>
          )}
        </section>
      </main>
    </>
  );
}
