import SummaryPanel from "./components/SummaryPanel";
import { useState, useEffect, useRef } from "react";
import Calendar from "./components/Calendar";
import EventModal from "./components/EventModal";
import { scheduleEventReminders } from "./utils/notifications";
import dayjs from "dayjs";
import { HiCalendar } from "react-icons/hi";
import Papa from "papaparse";
import "./index.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setView] = useState(localStorage.getItem("calendar-view") || "Month");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("calendar-theme") === "dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("calendar-events");
    return stored ? JSON.parse(stored) : [
      {
        title: "Team Sync-Up",
        date: "2025-06-24",
        time: "10:00",
        category: "work",
        recurrence: "none",
      },
    ];
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("calendar-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
    scheduleEventReminders(events); // 🚨 Notify upcoming events
  }, [events]);

  useEffect(() => {
    localStorage.setItem("calendar-view", currentView);
  }, [currentView]);

  const handleAddEvent = (newEvent) => {
    const { title, date, time, category, recurrence } = newEvent;
    const base = dayjs(`${date} ${time}`);
    const generated = [];

    if (recurrence === "none") {
      generated.push(newEvent);
    } else {
      const count = recurrence === "daily" ? 10 : 5;
      for (let i = 0; i < count; i++) {
        const futureDate = base.add(i, recurrence === "daily" ? "day" : recurrence).format("YYYY-MM-DD");
        generated.push({
          title,
          date: futureDate,
          time,
          category,
          recurrence: "none",
        });
      }
    }

    setEvents([...events, ...generated]);
  };

  const handleEditEvent = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.title === selectedEvent.title &&
        e.date === selectedEvent.date &&
        e.time === selectedEvent.time
          ? updatedEvent
          : e
      )
    );
  };

  const handleDeleteEvent = (toDelete) => {
    setEvents((prev) =>
      prev.filter(
        (e) =>
          !(
            e.title === toDelete.title &&
            e.date === toDelete.date &&
            e.time === toDelete.time
          )
      )
    );
  };

  const handleOpenEdit = (event) => {
    setSelectedEvent(event);
    setModalMode("edit");
    setShowModal(true);
  };

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();
    const dateStr = dayjs(event.date).format("MMM D, YYYY").toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.time.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      dateStr.includes(q)
    );
  });

  const downloadCSV = () => {
    const csvRows = [
      ["Title", "Date", "Time", "Category", "Recurrence"],
      ...filteredEvents.map((e) => [
        e.title,
        e.date,
        e.time,
        e.category,
        e.recurrence,
      ]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "calendar_events.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data;
        const valid = parsed.filter(
          (e) =>
            e.title &&
            dayjs(e.date, "YYYY-MM-DD", true).isValid() &&
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(e.time)
        );

        const newEvents = valid.map((e) => ({
          title: e.title,
          date: e.date,
          time: e.time,
          category: e.category || "other",
          recurrence: e.recurrence || "none",
        }));

        setEvents([...events, ...newEvents]);
        alert(`${newEvents.length} events imported successfully!`);
      },
    });

    e.target.value = null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 max-w-7xl mx-auto gap-4">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <HiCalendar className="text-4xl" />
          Event Calendar
        </h1>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={downloadCSV} className="px-3 py-1 rounded border text-sm bg-green-600 text-white hover:bg-green-700">
            ⬇️ Export CSV
          </button>
          <button onClick={() => fileInputRef.current.click()} className="px-3 py-1 rounded border text-sm bg-blue-600 text-white hover:bg-blue-700">
            📤 Import CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded border text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="max-w-7xl mx-auto mb-4">
        <SummaryPanel events={filteredEvents} />
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-4 gap-2 flex-wrap">
        {["Month", "Week", "Agenda"].map((view) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`px-3 py-1 rounded border font-medium transition duration-200 ${
              currentView === view
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {view}
          </button>
        ))}
        <button
          onClick={() => setCurrentDate(dayjs())}
          className="px-3 py-1 rounded border font-medium bg-green-600 text-white hover:bg-green-700 transition"
        >
          Today
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* Mini Calendar */}
        <div className="w-full lg:w-72 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-3">📌 Quick View</h2>
          <div className="grid grid-cols-7 text-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="font-semibold">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 4;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (day > 0) {
                      setCurrentDate(dayjs().date(day));
                      setView("Month");
                    }
                  }}
                  className="py-1 text-gray-700 dark:text-gray-200 rounded hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition"
                >
                  {day > 0 ? day : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar View */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-x-auto">
          <Calendar
            events={filteredEvents}
            view={currentView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            onEditEvent={handleOpenEdit}
            setEvents={setEvents} // ✅ Needed for drag-and-drop rescheduling
          />
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setModalMode("add");
          setSelectedEvent(null);
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 text-3xl font-bold rounded-full shadow-lg hover:bg-blue-700 transition"
        title="Add Event"
      >
        +
      </button>

      {/* Modal */}
      {showModal && (
        <EventModal
          mode={modalMode}
          initialData={selectedEvent}
          onClose={() => setShowModal(false)}
          onAdd={handleAddEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default App;
