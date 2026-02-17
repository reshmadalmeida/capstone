export const convertToCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString()}`;
};

export const toDDMMMYYYY = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
};

export const toYYYYMMDD = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d)) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isAllowed = (permissions, action) => {
  return permissions?.includes(action);
};
