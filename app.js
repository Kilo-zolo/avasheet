function saveData(startDate, endDate, tableData) {
  const identifier = `${startDate}-${endDate}`;
  let savedData = JSON.parse(localStorage.getItem("savedData")) || [];

  const existingDataIndex = savedData.findIndex((data) => data.identifier === identifier);

  if (existingDataIndex !== -1) {
    savedData[existingDataIndex] = { identifier, startDate, endDate, tableData };
  } else {
    savedData.push({ identifier, startDate, endDate, tableData });
  }

  localStorage.setItem("savedData", JSON.stringify(savedData));
}

// Add this event listener to handle the "Save" button click
document.getElementById("saveButton").addEventListener("click", function () {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const tableData = [];
  const resultTableBody = document.getElementById("resultTable").querySelector("tbody");
  
  resultTableBody.querySelectorAll("tr").forEach((row) => {
    const rowData = {
      date: row.cells[0].textContent,
      day: row.cells[1].textContent,
      participant: row.cells[2].textContent,
      action: row.cells[3].textContent,
      duration: row.cells[4].textContent,
    };
    tableData.push(rowData);
  });

  saveData(startDate, endDate, tableData);
  alert("Data saved successfully.");
});

function getDayNumber(dayName) {
  const days = {
    "sunday": 0,
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6,
  };
  return days[dayName.trim().toLowerCase()] ?? -1;
}

function getLastAddedDate(tableBody) {
  const lastRow = tableBody.lastElementChild;
  if (lastRow) {
    const lastDateCell = lastRow.cells[0];
    const lastDateString = lastDateCell.textContent;
    if (lastDateString) {
      return new Date(lastDateString);
    }
  }
  return null;
}

function getNextDateWithDay(date, targetDay, searchStartDate) {
  const currentDate = searchStartDate ? new Date(searchStartDate) : new Date(date);
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return currentDate;
}

function createRow(startDate, endDate) {
  const row = document.createElement("tr");

  // Date column
  const dateCell = document.createElement("td");
  row.appendChild(dateCell);

  // Day column
  const dayCell = document.createElement("td");
  dayCell.contentEditable = "true";
  dayCell.addEventListener("input", function () {
    const newDay = getDayNumber(this.textContent);
    if (newDay !== -1) {
      const tableBody = this.parentElement.parentElement;
      const lastAddedDate = getLastAddedDate(tableBody);
      const searchStartDate = lastAddedDate && lastAddedDate > startDate ? lastAddedDate : startDate;
      const newDate = getNextDateWithDay(searchStartDate, newDay, searchStartDate);
  
      if (newDate <= endDate) {
        this.previousElementSibling.textContent = newDate.toISOString().split("T")[0];
      }
    } else {
      this.previousElementSibling.textContent = "";
    }
  });
  
  row.appendChild(dayCell);

  // Participant column
  const participantCell = document.createElement("td");
  participantCell.contentEditable = "true";
  row.appendChild(participantCell);

  // Action column
  const actionCell = document.createElement("td");
  actionCell.contentEditable = "true";
  row.appendChild(actionCell);

  // Duration column
  const durationCell = document.createElement("td");
  durationCell.contentEditable = "true";
  durationCell.addEventListener("input", function () {
    if (!this.closest("tr").nextElementSibling) {
      const newRow = createRow(startDate, endDate);
      this.closest("tbody").appendChild(newRow);
    }
  });
  row.appendChild(durationCell);

  return row;
}

document.getElementById("dateForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);
  
  // Enforce one-week duration between start and end dates
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > oneWeekInMs) {
    alert("Date range must not exceed one week.");
    return;
  }

  const resultTableBody = document.getElementById("resultTable").querySelector("tbody");
  
  // Clear the table body before appending new rows
  resultTableBody.innerHTML = "";

  // Create a single empty row
  const row = createRow(startDate, endDate);
  resultTableBody.appendChild(row);
});

const urlParams = new URLSearchParams(window.location.search);
const savedDataString = urlParams.get("data");

if (savedDataString) {
  const savedData = JSON.parse(decodeURIComponent(savedDataString));
  document.getElementById("startDate").value = savedData.startDate;
  document.getElementById("endDate").value = savedData.endDate;

  const resultTableBody = document.getElementById("resultTable").querySelector("tbody");
  resultTableBody.innerHTML = "";

  savedData.tableData.forEach((rowData) => {
    const row = createRow(new Date(savedData.startDate), new Date(savedData.endDate));
    row.cells[0].textContent = rowData.date;
    row.cells[1].textContent = rowData.day;
    row.cells[2].textContent = rowData.participant;
    row.cells[3].textContent = rowData.action;
    row.cells[4].textContent = rowData.duration;
    resultTableBody.appendChild(row);
  });

  // Create a new empty row at the end
  const newRow = createRow(new Date(savedData.startDate), new Date(savedData.endDate));
  resultTableBody.appendChild(newRow);
}
