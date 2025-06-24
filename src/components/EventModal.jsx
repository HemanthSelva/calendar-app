import React, { useState, useEffect } from "react";

const EventModal = ({
  mode = "add",
  initialData = {},
  onClose,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("other");
  const [recurrence, setRecurrence] = useState("none");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setDate(initialData.date || "");
      setTime(initialData.time || "");
      setCategory(initialData.category || "other");
      setRecurrence(initialData.recurrence || "none");
    }
  }, [initialData, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    const updatedEvent = { title, date, time, category, recurrence };

    if (mode === "edit") {
      onEdit({ ...initialData, ...updatedEvent });
    } else {
      onAdd(updatedEvent);
    }

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete(initialData);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl animate-fadeIn transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {mode === "edit" ? "Edit Event" : "Add New Event"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="Event Title"
            aria-label="Event Title"
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="date"
            aria-label="Date"
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            aria-label="Time"
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <select
            aria-label="Category"
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="meeting">Meeting</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>

          <select
            aria-label="Recurrence"
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="none">No Repeat</option>
            <option value="daily">Repeat Daily</option>
            <option value="weekly">Repeat Weekly</option>
          </select>

          <div className="flex justify-between items-center gap-2 mt-4">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {mode === "edit" ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
