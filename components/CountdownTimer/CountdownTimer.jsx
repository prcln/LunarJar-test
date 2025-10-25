// CountdownTimer.jsx
import React, { useState, useEffect } from "react";

const CountdownTimer = () => {
  // 🧨 Set your Lunar New Year date (e.g., Jan 29, 2026)
  const targetDate = new Date("2026-02-17T00:00:00+07:00").getTime();

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ ended: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.ended) {
    return <p className="text-xl font-bold text-red-600">🎉 Happy Lunar New Year! 🧧</p>;
  }

  return (
    <div className="text-center p-4 bg-red-50 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-red-700">
        🧧 Countdown to Lunar New Year 2026 🐉
      </h2>
      <p className="text-lg text-gray-700">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </p>
    </div>
  );
};

export default CountdownTimer;
