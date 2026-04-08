import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

// All Image Imports
import aprImg from "../assets/april.jpg";
import augImg from "../assets/august.jpg";
import decImg from "../assets/december.jpg";
import febImg from "../assets/february.jpg";
import janImg from "../assets/january.jpg";
import julImg from "../assets/july.jpg";
import junImg from "../assets/june.png";
import marImg from "../assets/march.jpg";
import mayImg from "../assets/may.jpg";
import novImg from "../assets/novemebr.jpg";
import octImg from "../assets/october.jpg";
import sepImg from "../assets/september.png";

const CalendarComponent = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const currentYear = 2026;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [direction, setDirection] = useState(0);

  // Scribble Logic
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [themeColor, setThemeColor] = useState("#F9B2D7");
  const colorOptions = [
    { name: "Pink", hex: "#F9B2D7" },
    { name: "Orange", hex: "#FF9644" },
    { name: "Blue", hex: "#5E7AC4" },
    { name: "Green", hex: "#85C79A" },
    { name: "Original", hex: "#e0335d" },
  ];

  //monthImages[index]  0 - Jan .... 11 - dec
  const monthImages = [
    janImg,
    febImg,
    marImg,
    aprImg,
    mayImg,
    junImg,
    julImg,
    augImg,
    sepImg,
    octImg,
    novImg,
    decImg,
  ];
  const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Life is what happens when you're busy making other plans.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "The only impossible journey is the one you never begin.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "Your time is limited, so don't waste it living someone else's life.",
    "Everything you've ever wanted is on the other side of fear.",
    "Life is 10% what happens to us and 90% how we react to it.",
    "The purpose of our lives is to be happy.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "Believe you can and you're halfway there.",
  ];

  const coverQuote =
    "Every great year begins with a single day. Make each one count.";
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const storageKey = `cal_${currentYear}_${currentMonth}`;
  const scribbleKey = `scribble_${currentYear}_${currentMonth}`;
  const [notes, setNotes] = useState({ monthly: "" });
  const [holidays, setHolidays] = useState({});

  //local storage of notes etc..
  useEffect(() => {
    try {
      const s = localStorage.getItem(`notes_${storageKey}`);
      setNotes(s ? JSON.parse(s) : { monthly: "" });
      const h = localStorage.getItem(`holidays_${storageKey}`);
      setHolidays(h ? JSON.parse(h) : {});
      loadCanvas();
    } catch (err) {
      setNotes({ monthly: "" });
      setHolidays({});
    }
  }, [storageKey, currentMonth, showCover]);

  useEffect(() => {
    localStorage.setItem(`notes_${storageKey}`, JSON.stringify(notes));
    localStorage.setItem(`holidays_${storageKey}`, JSON.stringify(holidays));
  }, [notes, holidays, storageKey]);

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL();
    localStorage.setItem(scribbleKey, dataURL);
  };

  //canvas for scribble area & drawing logics
  const loadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const savedData = localStorage.getItem(scribbleKey);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (savedData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = savedData;
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvas();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(scribbleKey);
  };

  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayOfMonth = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const prevPadding = Array.from(
    { length: firstDayOfMonth },
    (_, i) => prevMonthLastDay - (firstDayOfMonth - 1) + i
  );
  const currentDays = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const nextPadding = Array.from(
    { length: 42 - (prevPadding.length + currentDays.length) },
    (_, i) => i + 1
  );

  //next - last month logics
  const changeMonth = (offset) => {
    if (showCover) {
      if (offset === 1) {
        setShowCover(false);
        setCurrentMonth(0);
        setDirection(1);
      }
      return;
    }
    if (offset === -1 && currentMonth === 0) {
      setDirection(-1);
      setShowCover(true);
      setStartDate(null);
      setEndDate(null);
      return;
    }
    if (offset === 1 && currentMonth === 11) return;
    setDirection(offset);
    setCurrentMonth((prev) => prev + offset);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (day < startDate) {
      setStartDate(day);
      setEndDate(null);
    } else if (day === startDate) {
      setStartDate(null);
      setEndDate(null);
    } else {
      setEndDate(day);
    }
  };

  // holiday logic
  const toggleHoliday = () => {
    if (!startDate) return;
    if (holidays[startDate]) {
      const nh = { ...holidays };
      delete nh[startDate];
      setHolidays(nh);
    } else {
      const title = prompt("Enter Event Name:", "New Event");
      if (title) setHolidays({ ...holidays, [startDate]: title });
    }
  };

  const getDayClass = (day, type = "current") => {
    const base =
      "h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full transition-all text-sm font-medium relative ";
    if (type !== "current")
      return base + "text-gray-300 cursor-default opacity-40";
    return base + "hover:bg-gray-100 text-gray-700 ";
  };

  const gridVariants = {
    enter: (d) => ({
      rotateX: d > 0 ? -90 : 90,
      opacity: 0,
      y: d > 0 ? 50 : -50,
    }),
    center: { rotateX: 0, opacity: 1, y: 0 },
    exit: (d) => ({
      rotateX: d > 0 ? 90 : -90,
      opacity: 0,
      y: d > 0 ? -50 : 50,
    }),
  };

  const monthSlideVariants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  const isLastMonth = !showCover && currentMonth === 11;

  //frontend ui starts here
  return (
    <div className="min-h-screen bg-[#d1d5db] p-2 md:p-4 flex items-center justify-center font-sans overflow-x-hidden">
      <div
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row transform md:scale-95 transition-transform"
        style={{ perspective: "1000px" }}
      >
        <div className="absolute -top-5 left-0 right-0 flex justify-around px-6 md:px-12 z-50 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`flex-col items-center ${
                i >= 6 ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="w-1.5 md:w-2 h-7 md:h-8 bg-gradient-to-r from-gray-900 via-black to-gray-800 rounded-full shadow-md" />
              <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-black rounded-full -mt-2 shadow-inner" />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showCover && (
            <motion.div
              key="cover"
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="absolute inset-0 z-40 rounded-3xl overflow-hidden flex"
              style={{ background: themeColor }}
            >
              <div className="absolute right-4 md:right-8 top-6 md:top-8 flex flex-col gap-3 z-50 bg-black/10 p-2 rounded-full backdrop-blur-sm">
                {colorOptions.map((color) => (
                  <button
                    key={color.hex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeColor(color.hex);
                    }}
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white/20 transition-transform hover:scale-125 ${
                      themeColor === color.hex
                        ? "ring-2 ring-white shadow-lg scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              <div className="w-6 md:w-10 flex-shrink-0 bg-black/20 flex flex-col items-center justify-center gap-5 py-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/40"
                  />
                ))}
              </div>

              <div className="flex-1 relative flex flex-col justify-between p-8 md:p-16 overflow-hidden">
                <div className="absolute -right-32 -top-32 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full border-[30px] md:border-[60px] border-white/10 pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 md:w-12 bg-white/50" />
                  <span className="text-white/70 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase">
                    Annual Planner
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <motion.h1
                    className="text-white font-black leading-none tracking-tighter"
                    style={{ fontSize: "clamp(60px, 15vw, 180px)" }}
                  >
                    2026
                  </motion.h1>
                  <div className="max-w-xs md:max-w-md">
                    <div className="h-1 w-8 md:w-12 bg-white mb-4" />
                    <p className="text-white/90 text-sm md:text-lg font-serif italic leading-relaxed">
                      "{coverQuote}"
                    </p>
                  </div>
                </div>
                <motion.div
                  className="flex items-center gap-3 cursor-pointer group w-fit"
                  onClick={() => changeMonth(1)}
                >
                  <span className="text-white/80 text-[10px] md:text-xs font-bold tracking-widest uppercase group-hover:text-white transition-colors">
                    Open Calendar
                  </span>
                  <svg
                    className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full md:w-1/3 relative bg-gray-950 h-64 md:h-auto min-h-[250px] md:min-h-full rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl overflow-hidden z-10">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentMonth}
              src={monthImages[currentMonth]}
              alt={monthNames[currentMonth]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="relative z-10 p-6 md:p-8 text-white h-full flex flex-col justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                {currentYear}
              </h1>
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.p
                    key={currentMonth}
                    custom={direction}
                    variants={monthSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-sm md:text-lg tracking-[0.3em] font-light uppercase text-white"
                  >
                    {monthNames[currentMonth]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <div className="p-2">
              <div
                className="h-1 w-8 mb-4"
                style={{ backgroundColor: themeColor }}
              />
              <p className="text-xs md:text-sm italic font-serif leading-relaxed opacity-90">
                {startDate && holidays[startDate]
                  ? `Event: ${holidays[startDate]}`
                  : quotes[currentMonth]}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 flex flex-col bg-white rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 z-20 bg-white">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="overflow-hidden w-28 md:w-36 text-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.h2
                    key={currentMonth}
                    custom={direction}
                    variants={monthSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-xl md:text-2xl font-black tracking-tight"
                    style={{ color: themeColor }}
                  >
                    {monthNames[currentMonth]}
                  </motion.h2>
                </AnimatePresence>
              </div>
              <button
                onClick={() => changeMonth(1)}
                disabled={isLastMonth}
                className={`p-2 rounded-full transition-colors ${
                  isLastMonth
                    ? "text-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-400 hover:text-black"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {startDate && (
              <button
                onClick={toggleHoliday}
                className="text-[9px] md:text-[10px] font-bold px-3 md:px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor: `${themeColor}20`,
                  color: themeColor,
                }}
              >
                {holidays[startDate] ? "✕ REMOVE" : "+ ADD EVENT"}
              </button>
            )}
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={currentMonth}
                custom={direction}
                variants={gridVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
                style={{
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="grid grid-cols-7 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d, i) => (
                      <div
                        key={d}
                        className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                        style={{ color: i > 4 ? themeColor : "#9ca3af" }}
                      >
                        {d}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {prevPadding.map((day) => (
                    <div key={`prev-${day}`} className="flex justify-center">
                      <div className={getDayClass(day, "prev")}>{day}</div>
                    </div>
                  ))}
                  {currentDays.map((day, i) => {
                    const start = startDate
                      ? Math.min(startDate, endDate || startDate)
                      : null;
                    const end = endDate
                      ? Math.max(startDate, endDate)
                      : startDate;
                    const isWithinRange =
                      start && end && day >= start && day <= end;
                    const isSelected =
                      day === startDate || day === endDate || isWithinRange;
                    const isToday =
                      today.getDate() === day &&
                      today.getMonth() === currentMonth &&
                      today.getFullYear() === currentYear;
                    const isWeekend =
                      (i + prevPadding.length) % 7 === 5 ||
                      (i + prevPadding.length) % 7 === 6;

                    return (
                      <div key={day} className="flex justify-center">
                        <button
                          onClick={() => handleDateClick(day)}
                          className={getDayClass(day, "current")}
                          style={{
                            backgroundColor: isSelected ? themeColor : "",
                            color: isSelected
                              ? "white"
                              : isWeekend
                              ? themeColor
                              : "#374151",
                            outline:
                              isToday && !isSelected
                                ? `2px solid ${themeColor}`
                                : "",
                            outlineOffset: "2px",
                            opacity:
                              isWithinRange &&
                              day !== startDate &&
                              day !== endDate
                                ? 0.7
                                : 1,
                          }}
                        >
                          {day}
                          {holidays[day] && (
                            <span
                              className="absolute bottom-1 w-1 h-1 rounded-full"
                              style={{
                                backgroundColor: isSelected
                                  ? "white"
                                  : themeColor,
                              }}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  {nextPadding.map((day) => (
                    <div key={`next-${day}`} className="flex justify-center">
                      <div className={getDayClass(day, "next")}>{day}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 z-20 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {startDate
                  ? `Notes for ${startDate} ${monthNames[currentMonth]}...`
                  : "Notes..."}
              </span>
              {startDate && (
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="text-[9px] font-black flex items-center gap-1 transition-colors hover:opacity-70 uppercase"
                  style={{ color: themeColor }}
                >
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M10 19l-7-7 7-7"
                    />
                  </svg>{" "}
                  BACK TO MONTHLY VIEW
                </button>
              )}
            </div>

            <div className="flex flex-row gap-4 items-start">
              <div className="flex-1 relative">
                <textarea
                  value={
                    notes[startDate ? `day_${startDate}` : "monthly"] || ""
                  }
                  onChange={(e) =>
                    setNotes({
                      ...notes,
                      [startDate ? `day_${startDate}` : "monthly"]:
                        e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 rounded-none p-0 text-sm text-gray-700 h-24 resize-none leading-[24px]"
                  style={{
                    caretColor: themeColor,
                    backgroundImage: `linear-gradient(transparent, transparent 23px, #e5e7eb 23px)`,
                    backgroundSize: "100% 24px",
                    paddingTop: "4px",
                  }}
                />
              </div>

              <div className="w-24 md:w-28 flex flex-col items-center shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg border border-gray-200 relative cursor-crosshair overflow-hidden group">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    width={96}
                    height={96}
                    className="w-full h-full touch-none"
                  />
                  <button
                    onClick={clearCanvas}
                    className="absolute bottom-1 right-1 px-2 py-1 text-[9px] font-extrabold text-gray-400 md:opacity-0 md:group-hover:opacity-100 hover:text-red-500 transition-all z-30"
                  >
                    CLR
                  </button>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Scribble
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
