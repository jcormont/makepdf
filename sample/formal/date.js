let dd = new Date();
let month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
][dd.getMonth()];

export default { text: month + " " + dd.getFullYear(), style: "p" };
