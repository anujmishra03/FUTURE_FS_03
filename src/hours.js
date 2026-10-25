const SCHEDULE = [
  { day: 'Sunday', open: 8, close: 18, label: '8:00 AM – 6:00 PM' },
  { day: 'Monday', open: 7, close: 20, label: '7:00 AM – 8:00 PM' },
  { day: 'Tuesday', open: 7, close: 20, label: '7:00 AM – 8:00 PM' },
  { day: 'Wednesday', open: 7, close: 20, label: '7:00 AM – 8:00 PM' },
  { day: 'Thursday', open: 7, close: 21, label: '7:00 AM – 9:00 PM' },
  { day: 'Friday', open: 7, close: 22, label: '7:00 AM – 10:00 PM' },
  { day: 'Saturday', open: 8, close: 22, label: '8:00 AM – 10:00 PM' }
];

function getBusinessStatus(now = new Date()) {
  const dayIndex = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const todaySchedule = SCHEDULE[dayIndex];

  const isOpen = currentHour >= todaySchedule.open && currentHour < todaySchedule.close;

  let message = '';
  if (isOpen) {
    const closeHour = Math.floor(todaySchedule.close);
    const closeMin = Math.round((todaySchedule.close - closeHour) * 60);
    const formattedClose = `${closeHour > 12 ? closeHour - 12 : closeHour}:${closeMin === 0 ? '00' : closeMin} ${closeHour >= 12 ? 'PM' : 'AM'}`;
    message = `Open Now · Closes at ${formattedClose}`;
  } else {
    if (currentHour < todaySchedule.open) {
      const openHour = Math.floor(todaySchedule.open);
      message = `Closed · Opens today at ${openHour}:00 AM`;
    } else {
      const tomorrowIndex = (dayIndex + 1) % 7;
      const tomorrowSchedule = SCHEDULE[tomorrowIndex];
      const openHour = Math.floor(tomorrowSchedule.open);
      message = `Closed · Opens tomorrow at ${openHour}:00 AM`;
    }
  }

  return {
    isOpen,
    message,
    today: todaySchedule.day,
    todayHours: todaySchedule.label,
    schedule: SCHEDULE
  };
}

module.exports = { SCHEDULE, getBusinessStatus };
