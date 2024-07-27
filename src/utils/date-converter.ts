import dayjs from "dayjs";

export function startOfToday() {
  return dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
}

export function endOfToday() {
  return dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss");
}

export function startOfTomorrow() {
  return dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
}

export function endOfTomorrow() {
  return dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
}
