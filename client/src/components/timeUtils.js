// 0. Timestamps

// Helper array for getTimestamp function, note this must be from largest to smallest in # of seconds.
const timeUnits = [
    // Unit Name    | # of seconds      | UI representation of this unit
    { name: "year",   seconds: 31536000,  display: "yr." },
    { name: "month",  seconds: 2592000,   display: "mo." },
    { name: "day",    seconds: 86400,     display: "days." },
    { name: "hour",   seconds: 3600,      display: "hr." },
    { name: "minute", seconds: 60,        display: "min." },
    { name: "second", seconds: 1,         display: "sec." }
];

// Returns a string representation of how long ago a post was made.
export function getTimestamp(postedDate, currentDate = new Date()) {
    let timeDiff = Math.floor((currentDate - postedDate) / 1000);            // Get time difference in seconds
    for (let i = 0; i < timeUnits.length; i++) {                             // Iterate through time units:
        let unitTime = Math.floor(timeDiff / timeUnits[i].seconds);          //   Get the amount of this unit
        if (unitTime >= 1) return `${unitTime} ${timeUnits[i].display} ago`; //   If this unit is at least 1, return the timestamp string
    }
    return "just now";
}