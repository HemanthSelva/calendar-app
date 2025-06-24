import React from "react";
import dayjs from "dayjs";
import {
  HiChevronLeft,
  HiChevronRight,
  HiExclamationCircle,
} from "react-icons/hi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  setEvents,
}) => {
  const startOfMonth = currentDate.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentDate.daysInMonth();

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNext = () => setCurrentDate(currentDate.add(1, "month"));

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const draggedEvent = events.find((e, i) => `event-${i}` === draggableId);
    if (!draggedEvent) return;

    const newDate = destination.droppableId;
    const updatedEvent = { ...draggedEvent, date: newDate };

    const updatedEvents = events.map((e) =>
      e === draggedEvent ? updatedEvent : e
    );

    setEvents(updatedEvents);
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
        <Droppable key={dateStr} droppableId={dateStr}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
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

                  const categoryClass =
                    categoryColors[event.category] || categoryColors.other;

                  return (
                    <Draggable
                      key={`event-${events.indexOf(event)}`}
                      draggableId={`event-${events.indexOf(event)}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onEditEvent(event)}
                          className={`cursor-pointer group text-xs font-medium px-2 py-1 rounded-md shadow-sm border transition-all duration-200 transform hover:scale-[1.02] ${categoryClass} ${
                            isConflict ? "border-dashed border-2" : ""
                          }`}
                          title={`${event.title} at ${event.time} (${event.category})`}
                        >
                          {event.time} – {event.title}
                          {isConflict && (
                            <HiExclamationCircle className="inline text-red-600 text-sm ml-1" />
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      );
    }

    return days;
  };

  if (view !== "Month") {
    return <div className="text-sm text-gray-600">Only Month view supports drag-and-drop.</div>;
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

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-7 gap-0 border">{generateDays()}</div>
      </DragDropContext>
    </div>
  );
};

export default Calendar;
