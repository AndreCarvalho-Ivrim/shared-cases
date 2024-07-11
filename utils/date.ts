import moment, { Moment } from "moment";
import "moment-timezone";

export const convertDate = (date: Date) => {
  const formatDate = moment(date).tz('America/Sao_Paulo').toDate();
  return formatDate;
}

export const differenceMinutes = (hour: Date): number => {
  const now = moment.tz('America/Sao_Paulo');
  const normalizedHour = moment(hour, "YYYY-MM-DD hh:mm:ss");
  return now.diff(normalizedHour, "minutes");
}