import "moment-timezone";

export const convertDate = (application: string, date: Date) => {
  let formatDate = new Date();
  if (application === 'isac') formatDate.setHours(formatDate.getHours() + 3);
  return formatDate;
}

export const differenceMinutes = (application: string, hour: Date): number => {
  let now = new Date();
  if(application === 'isac') now.setHours(now.getHours() + 3);
  const normalizedData = new Date(hour);
  let diff = (normalizedData.getTime() - now.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}