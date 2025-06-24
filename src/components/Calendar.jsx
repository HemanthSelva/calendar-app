import React from "react";
import dayjs from "dayjs";
import {
  HiChevronLeft,
  HiChevronRight,
  HiExclamationCircle,
} from "react-icons/hi";

const categoryColors = {
  work: "bg-blue-100 text-blue-800 border-blue-300",
  personal: "bg-green-100 text-green-800 border-green-300",
  meeting: "bg-yellow-100 text-yellow-800 border-yellow-300",
  event: "bg-purple-100 text-purple-800 border-purple-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
};

const Calendar = ({
  events,
  view,
  currentDate,
  setCurrentDate,
  onEditEvent,
  searchQuery = "",
}) => {
  const startOfMonth = currentDate.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentDate.daysInMonth();

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNext = () => setCurrentDate(currentDate.add(1, "month"));

  const isEventMatch = (event) => {
    const q = searchQuery.toLowerCase();
    const dateStr = dayjs(event.date).format("MMM D, YYYY").toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.time.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      dateStr.includes(q)
    );
  };

  const generateDays = () => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="border bg-white h-32" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentDate.date(day);
      const dateStr = date.format("YYYY-MM-DD");
      const dayEvents = events.filter((e) => e.date === dateStr);
      const isToday = dayjs().isSame(date, "day");

      days.push(
        <div
          key={day}
          className={`border h-32 p-1 overflow-hidden transition-all duration-300 rounded-md relative ${
            isToday
              ? "bg-blue-100 border-blue-500 scale-[1.02]"
              : "bg-white hover:shadow-md hover:scale-[1.01]"
          }`}
        >
          <div className="text-sm font-bold text-right text-gray-700">
            {day}
          </div>

          <div className="flex flex-col gap-1 mt-1 text-xs max-h-[90%] pr-1 overflow-y-auto">
            {dayEvents.map((event, index) => {
              const eventStart = dayjs(`${event.date} ${event.time}`);
              const isConflict = dayEvents.some((e, i) => {
                if (i === index) return false;
                const otherStart = dayjs(`${e.date} ${e.time}`);
                return Math.abs(otherStart.diff(eventStart, "minute")) < 60;
              });

              const isMatch = isEventMatch(event);
              const categoryClass =
                categoryColors[event.category] || categoryColors["other"];

              return (
                <div
                  key={index}
                  onClick={() => onEditEvent(event)}
                  className={`cursor-pointer group text-xs font-medium px-2 py-1 rounded-md shadow-sm border transition-all duration-200 transform hover:scale-[1.02] ${categoryClass} ${
                    isConflict ? "border-dashed border-2" : ""
                  } ${isMatch ? "ring-2 ring-blue-500" : ""}`}
                  title={`${event.title} at ${event.time} (${event.category})`}
                >
                  {event.time} – {event.title}
                  {isConflict && (
                    <HiExclamationCircle className="inline text-red-600 text-sm ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  if (view === "Agenda") {
    return (
      <div className="space-y-3 animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          📋 Upcoming Events
        </h2>
        {events
          .sort((a, b) =>
            dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`))
          )
          .map((event, index) => {
            const isMatch = isEventMatch(event);
            const categoryClass =
              categoryColors[event.category] || categoryColors["other"];

            return (
              <div
                key={index}
                onClick={() => onEditEvent(event)}
                className={`cursor-pointer p-3 bg-white dark:bg-gray-800 rounded-md shadow border-l-4 transition ${categoryClass} ${
                  isMatch ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {event.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {event.date} at {event.time} ({event.category})
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  if (view === "Week") {
    const weekStart = currentDate.startOf("week");
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      weekStart.add(i, "day")
    );

    return (
      <div className="animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          🗓️ Week of {weekStart.format("MMM D")}
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayEvents = events.filter((e) => e.date === dateStr);

            return (
              <div
                key={dateStr}
                className="p-2 border rounded bg-white dark:bg-gray-800 h-40 overflow-hidden hover:scale-[1.01] transition"
              >
                <div className="text-sm font-bold text-gray-700 dark:text-gray-100 mb-1">
                  {day.format("ddd D")}
                </div>
                <div className="flex flex-col gap-1 max-h-[85%] overflow-y-auto">
                  {dayEvents.map((event, i) => {
                    const isMatch = isEventMatch(event);
                    const categoryClass =
                      categoryColors[event.category] || categoryColors["other"];
                    return (
                      <div
                        key={i}
                        onClick={() => onEditEvent(event)}
                        className={`text-xs rounded px-2 py-1 shadow-sm border cursor-pointer transition-all ${categoryClass} ${
                          isMatch ? "ring-2 ring-blue-500" : ""
                        }`}
                      >
                        {event.time} – {event.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrev}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center gap-1"
        >
          <HiChevronLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {currentDate.format("MMMM YYYY")}
        </h1>
        <button
          onClick={handleNext}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center gap-1"
        >
          <HiChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 bg-gray-100 dark:bg-gray-700 border">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 border">{generateDays()}</div>
    </div>
  );
};

export default Calendar;
