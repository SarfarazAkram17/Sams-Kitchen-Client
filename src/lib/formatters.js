export const formatDate = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export { formatCurrency } from "./money";
