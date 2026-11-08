import { useEffect, useRef, useState } from "react";
import { formatTime } from "./dateUtils.js";
import DateField from "./DateField.jsx";

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [date, setDate] = useState(todo.date);
  const [time, setTime] = useState(todo.time || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setTitle(todo.title);
    setDate(todo.date);
    setTime(todo.time || "");
    setEditing(true);
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed || !date) return;
    onEdit(todo.id, { title: trimmed, date, time });
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <li className="todo editing" onKeyDown={handleKeyDown}>
        <div className="edit-fields">
          <input
            ref={inputRef}
            className="edit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Task title"
          />
          <div className="edit-row">
            <DateField value={date} onChange={setDate} ariaLabel="Task date" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Task time"
            />
            <button className="primary" onClick={save}>
              Save
            </button>
            <button onClick={cancel}>Cancel</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`todo${todo.done ? " done" : ""}`}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.done ? "active" : "done"}`}
      />

      <span className="title" onDoubleClick={startEditing}>
        {todo.title}
      </span>

      {todo.time && <span className="time">{formatTime(todo.time)}</span>}

      <div className="actions">
        <button onClick={startEditing} aria-label="Edit task">
          Edit
        </button>
        <button
          className="danger"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
