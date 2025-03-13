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
          // Total units (adjust as needed)
          const totalUnits = 48 + 9 + 63; // Completed + In-progress + Incomplete

          // Get unit values
          const completedUnits = 48;
          const inProgressUnits = 9;

          // Calculate width percentages
          const completedWidth = (completedUnits / totalUnits) * 100;
          const inProgressWidth = (inProgressUnits / totalUnits) * 100;

          // Update bar widths
          document.querySelector(".progress-completed").style.width = completedWidth + "%";
          document.querySelector(".progress-in-progress").style.width = inProgressWidth + "%";
          document.querySelector(".progress-in-progress").style.left = completedWidth + "%"; // Start after completed
        });