import { format, formatDistanceToNow } from "date-fns";

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function fDateTime(date) {
  return format(new Date(date), "yyyy-MM-dd HH:mm");
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), "yyyy-MM-dd hh:mm p");
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}
