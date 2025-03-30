// Function to show/hide GPA popup
function showGPA() {
  document.getElementById("gpa-popup").style.display = "flex";
}

function hideGPA() {
  document.getElementById("gpa-popup").style.display = "none";
}

// Function to toggle dropdowns
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

// Collapse all sections on page load
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".requirements-section").forEach((section) => {
    const content = section.querySelector(".section-content");
    const arrow = section.querySelector(".arrow");

    content.style.display = "none"; // Collapse all sections
    section.classList.remove("expanded");
    arrow.innerHTML = "▶"; // Reset arrows
  });
});

// Function to show alerts with university news
function showAlerts() {
  alert("📢 University News: Midterm dates announced! Check your emails.");
}

// Sidebar Toggle Function (If Not Already Added)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}

// Javacsript for Reuirements.html Page

function toggleSection(header) {
  const section = header.parentElement;
  const content = section.querySelector(".section-content");
  const arrow = section.querySelector(".arrow");

  if (content.style.display === "block") {
    content.style.display = "none"; // Collapse section
    section.classList.remove("expanded"); // Reset arrow
    arrow.innerHTML = "▶"; // Arrow points right
  } else {
    content.style.display = "block"; // Expand section
    section.classList.add("expanded"); // Rotate arrow
    arrow.innerHTML = "▼"; // Arrow points down
  }
}
/* Ensure Sections Are Collapsed on Page Load */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".requirements-section").forEach((section) => {
    const content = section.querySelector(".section-content");
    const arrow = section.querySelector(".arrow");

    content.style.display = "none"; // Collapse all sections
    section.classList.remove("expanded");
    arrow.innerHTML = "▶"; // Reset arrows
  });
});

document.addEventListener("DOMContentLoaded", function () {
    // Total units
    const totalUnits = 48 + 9 + 63; // Completed + In-progress + Incomplete

    // Get unit values
    const completedUnits = 48;
    const inProgressUnits = 9;
    const incompleteUnits = 63;

    // Calculate width percentages
    const completedWidth = (completedUnits / totalUnits) * 100;
    const inProgressWidth = (inProgressUnits / totalUnits) * 100;
    const incompleteWidth = (incompleteUnits / totalUnits) * 100;

    // Update completed and in-progress bar widths
    document.querySelector(".progress-completed").style.width = completedWidth + "%";
    document.querySelector(".progress-in-progress").style.width = inProgressWidth + "%";
    document.querySelector(".progress-in-progress").style.left = completedWidth + "%"; // Start after completed

    // Fix for incomplete courses (Red section)
    const incompleteBar = document.querySelector(".progress-incomplete");
    if (incompleteBar) {
        incompleteBar.style.width = incompleteWidth + "%";
        incompleteBar.style.left = (completedWidth + inProgressWidth) + "%"; // Start after in-progress
    }
});

function loadHeader() {
  fetch('header.html')
    .then(response => response.text())
    .then(data => document.getElementById('header-container').innerHTML = data);
}

// Call the function to load the header on page load
document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
});

function toggleSection(header) {
    const section = header.parentElement;
    const content = section.querySelector(".section-content");
    const descriptions = section.querySelectorAll(".course-description"); // Select all descriptions
    const arrow = header.querySelector(".arrow");

    if (content.style.display === "block") {
        content.style.display = "none"; // Collapse section
        arrow.innerHTML = "▶"; // Arrow points right
    } else {
        content.style.display = "block"; // Expand section
        arrow.innerHTML = "▼"; // Arrow points down
    }

    // Loop through all descriptions and toggle them
    descriptions.forEach(description => {
        description.style.display = (description.style.display === "block") ? "none" : "block";
    });
}

function sortTableDropdown() {
  const sortBy = document.getElementById("sort-options").value;
  const table = document.getElementById("course-table-body");
  const rows = Array.from(table.getElementsByTagName("tr"));

  rows.sort((rowA, rowB) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case "course":
        valueA = rowA.cells[0].textContent.trim();
        valueB = rowB.cells[0].textContent.trim();
        break;

      case "term":
        valueA = convertTerm(rowA.cells[2].textContent.trim());
        valueB = convertTerm(rowB.cells[2].textContent.trim());
        break;

      case "year":
        valueA = parseInt(rowA.cells[3].textContent.trim()) || 0; // Default 0 for missing years
        valueB = parseInt(rowB.cells[3].textContent.trim()) || 0;
        return valueB - valueA; // Sort in descending order

      case "grade":
        valueA = convertGrade(rowA.cells[4].textContent.trim());
        valueB = convertGrade(rowB.cells[4].textContent.trim());
        break;

      case "status":
        valueA = convertStatus(rowA.cells[5].textContent.trim());
        valueB = convertStatus(rowB.cells[5].textContent.trim());
        break;

      default:
        return 0;
    }

    return valueA > valueB ? 1 : -1;
  });

  table.innerHTML = "";
  rows.forEach(row => table.appendChild(row));
}

// Convert term names to numeric values for correct sorting order
function convertTerm(term) {
  const termOrder = { "Winter": 1, "Spring": 2, "Summer": 3, "Fall": 4, "-": 5 };
  return termOrder[term] || 0;
}

// Convert letter grades to numerical values for sorting
function convertGrade(grade) {
  const gradeScale = { 
    "A+": 1, "A": 2, "A-": 3, 
    "B+": 4, "B": 5, "B-": 6, 
    "C+": 7, "C": 8, "C-": 9, 
    "D+": 10, "D": 11, "F": 12,
    "-": 13
  };
  return gradeScale[grade] || -1; // Default -1 for missing grades
}

// Convert status to numeric values for sorting
function convertStatus(status) {
  const statusOrder = { "Complete": 1, "In-progress": 2, "Incomplete": 3, "-": 4 };
  return statusOrder[status] || 5;
}