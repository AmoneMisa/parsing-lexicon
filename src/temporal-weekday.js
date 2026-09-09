import { addUtcDays } from './temporal-shared.js';

/** Weekday vocabulary shared by RelativeDateParser (next-weekday) and ScheduleCycleParser (weekday ranges). */

export const WEEKDAYS = Object.freeze(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
export const DAY_ALIASES = Object.freeze({
  пн: 0, понедельник: 0, понедельника: 0, понеділок: 0, понеділка: 0, mon: 0, monday: 0, dushanba: 0, дүйсенбі: 0, дүйшөмбү: 0, luni: 0,
  вт: 1, вторник: 1, вторника: 1, вівторок: 1, вівторка: 1, tue: 1, tuesday: 1, seshanba: 1, сейсенбі: 1, шейшемби: 1, marți: 1, marti: 1,
  ср: 2, среда: 2, среды: 2, середа: 2, середи: 2, wed: 2, wednesday: 2, chorshanba: 2, сәрсенбі: 2, шаршемби: 2, miercuri: 2,
  чт: 3, четверг: 3, четверга: 3, четвер: 3, четверга: 3, thu: 3, thursday: 3, payshanba: 3, бейсенбі: 3, бейшемби: 3, joi: 3,
  пт: 4, пятница: 4, пятницы: 4, "п'ятниця": 4, 'п’ятниця': 4, пятниця: 4, fri: 4, friday: 4, juma: 4, жұма: 4, жума: 4, vineri: 4,
  сб: 5, суббота: 5, субботы: 5, субота: 5, sat: 5, saturday: 5, shanba: 5, сенбі: 5, ишемби: 5, sâmbătă: 5, sambata: 5,
  вс: 6, воскресенье: 6, воскресенья: 6, неділя: 6, неділю: 6, sun: 6, sunday: 6, yakshanba: 6, жексенбі: 6, жекшемби: 6, duminică: 6, duminica: 6,
});
export const DAY_PATTERN = Object.keys(DAY_ALIASES).sort((a, b) => b.length - a.length).join('|');

export function nextWeekday(date, weekday) { const current = (date.getUTCDay() + 6) % 7; let days = (weekday - current + 7) % 7; if (days === 0) days = 7; return addUtcDays(date, days); }
