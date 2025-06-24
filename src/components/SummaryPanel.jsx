import React from "react";
import dayjs from "dayjs";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineTag,
} from "react-icons/hi";

const SummaryPanel = ({ events }) => {
  const today = dayjs().format("YYYY-MM-DD");
  const total = events.length;
  const todayEvents = events.filter((e) => e.date === today).length;
  const recurring = events.filter((e) => e.recurrence !== "none").length;

  const categoryCounts = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center flex flex-col items-center">
        <HiOutlineCalendar className="text-3xl text-blue-500 dark:text-blue-400 mb-1" />
        <div className="text-sm text-gray-500 dark:text-gray-300">Total Events</div>
        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{total}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center flex flex-col items-center">
        <HiOutlineClock className="text-3xl text-green-500 dark:text-green-400 mb-1" />
        <div className="text-sm text-gray-500 dark:text-gray-300">Today</div>
        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{todayEvents}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center flex flex-col items-center">
        <HiOutlineRefresh className="text-3xl text-purple-500 dark:text-purple-400 mb-1" />
        <div className="text-sm text-gray-500 dark:text-gray-300">Recurring</div>
        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{recurring}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <HiOutlineTag className="text-xl text-gray-500 dark:text-gray-300" />
          <span className="text-sm text-gray-500 dark:text-gray-300">By Category</span>
        </div>
        <div className="text-xs mt-2 space-y-1 text-gray-700 dark:text-gray-100">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat}>
              <span className="capitalize">{cat}</span>:{" "}
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
