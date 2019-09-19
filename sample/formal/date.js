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

module.exports = { text: month + " " + dd.getFullYear(), style: "p" };
