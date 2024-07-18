import moment, { Moment } from "moment";
import "moment-timezone";

export const convertDate = (application: string, date: Date) => {
  let formatDate = moment(date).tz('America/Sao_Paulo');
  if (application === 'isac') formatDate = formatDate.add(3, 'hours');
  return formatDate.toDate();
}

export const differenceMinutes = (application: string, hour: Date): number => {
  let now = moment.tz('America/Sao_Paulo');
  if(application === 'isac') now = now.add(3, 'hours');
  const normalizedHour = moment(hour, "YYYY-MM-DD hh:mm:ss");
  return now.diff(normalizedHour, "minutes");
}