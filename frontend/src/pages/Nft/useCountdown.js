import { useEffect, useState } from 'react';

const useCountdown = (targetDate) => {
  const [countDown, setCountDown] = useState(
    targetDate - new Date().getTime() / 1000
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(targetDate - new Date().getTime() / 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return getReturnValues(countDown * 1000);
};

const getReturnValues = (countDown) => {
  // calculate time left
  let days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  let hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  days = days < 10 ? "0" + days : days;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return [days, hours, minutes, seconds];
};

export { useCountdown };