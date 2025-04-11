/**
 * Simple course search and filter implementation
 * For HCI class project
 */

// Global variables
let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const coursesPerPage = 4;
const maxResults = 8;

// Default courses to show initially
const defaultCourses = [
    {
        "courseId": "CPSC217",
        "courseCode": "CPSC-217",
        "department": {"code": "CPSC", "name": "Computer Science"},
        "courseNumber": "217",
        "title": "Introduction to Computer Science for Multidisciplinary Studies I",
        "credits": 3,
        "level": 200,
        "prerequisites": null,
        "offeredIn": {"Fall": true, "Winter": true, "Spring": true, "Summer": false},
        "uniqueId": 1
    },
    {
        "courseId": "CPSC231",
        "courseCode": "CPSC-231",
        "department": {"code": "CPSC", "name": "Computer Science"},
        "courseNumber": "231",
        "title": "Introduction to Computer Science for Computer Science Majors I",
        "credits": 3,
        "level": 200,
        "prerequisites": {"or": ["Admission to CPSC"]},
        "offeredIn": {"Fall": true, "Winter": true, "Spring": true, "Summer": false},
        "uniqueId": 2
    },
    {
        "courseId": "MATH211",
        "courseCode": "MATH-211",
        "department": {"code": "MATH", "name": "Mathematics"},
        "courseNumber": "211",
        "title": "Linear Methods I",
        "credits": 3,
        "level": 200,
        "prerequisites": null,
        "offeredIn": {"Fall": true, "Winter": true, "Spring": true, "Summer": false},
        "uniqueId": 3
    },
    {
        "courseId": "PHIL279",
        "courseCode": "PHIL-279",
        "department": {"code": "PHIL", "name": "Philosophy"},
        "courseNumber": "279",
        "title": "Logic I",
        "credits": 3,
        "level": 200,
        "prerequisites": null,
        "offeredIn": {"Fall": true, "Winter": true, "Spring": false, "Summer": false},
        "uniqueId": 4
    }
];

// DOM elements
const searchInput = document.getElementById('courseSearch');
const facultyFilter = document.getElementById('facultyFilter');
const departmentFilter = document.getElementById('departmentFilter');
const levelFilter = document.getElementById('levelFilter');
const applyFiltersBtn = document.getElementById('applyFilters');
const activeFiltersContainer = document.getElementById('activeFilters');
const coursesContainer = document.getElementById('search-courses-container');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const paginationInfo = document.getElementById('pagination-info');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
});

// Initialize the page with default courses
async function initializePage() {
    try {
        // First load default courses
        allCourses = [...defaultCourses];
        filteredCourses = [...defaultCourses];
        
        // Try to load more courses from JSON file
        await loadCoursesFromJSON();
        
        // Display initial courses
        displayCourses();
        updatePagination();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Load courses from JSON file
async function loadCoursesFromJSON() {
    try {
        const response = await fetch('courses.json');
        if (!response.ok) {
            throw new Error('Failed to load courses data');
        }
        
        let jsonCourses = await response.json();
        
        // Make sure it's an array
        if (!Array.isArray(jsonCourses)) {
            jsonCourses = [];
        }
        
        // Filter out any courses that already exist in default courses
        const newCourses = jsonCourses.filter(jsonCourse => 
            !defaultCourses.some(course => course.courseId === jsonCourse.courseId)
        );
        
        // Add new courses to allCourses
        allCourses = [...allCourses, ...newCourses];
        
    } catch (error) {
        console.error('Error loading courses from JSON:', error);
        // Continue with default courses if JSON fails to load
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Apply filters button
    applyFiltersBtn.addEventListener('click', applyFilters);
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayCourses();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(Math.min(filteredCourses.length, maxResults) / coursesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayCourses();
            updatePagination();
        }
    });
    
    // Active filter removal
    activeFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag-close')) {
            const filterType = e.target.getAttribute('data-filter');
            document.getElementById(`${filterType}Filter`).value = '';
            applyFilters();
        }
    });
}

// Apply all filters to the course list
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const faculty = facultyFilter.value;
    const department = departmentFilter.value;
    const level = levelFilter.value;
    
    // Reset to page 1 when filtering
    currentPage = 1;
    
    // Filter courses
    filteredCourses = allCourses.filter(course => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            course.title.toLowerCase().includes(searchTerm) || 
            course.courseCode.toLowerCase().includes(searchTerm) ||
            `${course.department.code}${course.courseNumber}`.toLowerCase().includes(searchTerm);
        
        // Faculty filter
        const matchesFaculty = !faculty || 
            (faculty === 'Science' && ['CPSC', 'SENG', 'MATH'].includes(course.department.code)) ||
            (faculty === 'Arts' && course.department.code === 'PHIL');
        
        // Department filter
        const matchesDepartment = !department || course.department.code === department;
        
        // Level filter
        const matchesLevel = !level || 
            (level === '200' && course.level >= 200 && course.level < 300) ||
            (level === '300' && course.level >= 300 && course.level < 400) ||
            (level === '400' && course.level >= 400 && course.level < 500) ||
            (level === '500' && course.level >= 500);
        
        return matchesSearch && matchesFaculty && matchesDepartment && matchesLevel;
    });
    
    // Update UI
    updateActiveFilters();
    displayCourses();
    updatePagination();
}

// Update the active filters display
function updateActiveFilters() {
    activeFiltersContainer.innerHTML = '';
    
    const faculty = facultyFilter.value;
    const department = departmentFilter.value;
    const level = levelFilter.value;
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        const searchTag = document.createElement('div');
        searchTag.className = 'filter-tag';
        searchTag.innerHTML = `
            Search: "${searchTerm}"
            <span class="filter-tag-close" data-filter="course">✕</span>
        `;
        activeFiltersContainer.appendChild(searchTag);
    }
    
    if (faculty) {
        const facultyTag = document.createElement('div');
        facultyTag.className = 'filter-tag';
        facultyTag.innerHTML = `
            Faculty: ${faculty}
            <span class="filter-tag-close" data-filter="faculty">✕</span>
        `;
        activeFiltersContainer.appendChild(facultyTag);
    }
    
    if (department) {
        const deptTag = document.createElement('div');
        deptTag.className = 'filter-tag';
        deptTag.innerHTML = `
            Department: ${department}
            <span class="filter-tag-close" data-filter="department">✕</span>
        `;
        activeFiltersContainer.appendChild(deptTag);
    }
    
    if (level) {
        const levelTag = document.createElement('div');
        levelTag.className = 'filter-tag';
        levelTag.innerHTML = `
            Level: ${level}
            <span class="filter-tag-close" data-filter="level">✕</span>
        `;
        activeFiltersContainer.appendChild(levelTag);
    }
}

// Display current page of courses
function displayCourses() {
    coursesContainer.innerHTML = '';
    
    // Limit total results to maxResults (8)
    const limitedCourses = filteredCourses.slice(0, maxResults);
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, limitedCourses.length);
    
    // Display no results message if no courses found
    if (limitedCourses.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No courses found matching your criteria.';
        coursesContainer.appendChild(noResults);
        return;
    }
    
    // Display current page of courses
    for (let i = startIndex; i < endIndex; i++) {
        const course = limitedCourses[i];
        
        // Create course card using SearchCourseCard class
        const courseCard = new SearchCourseCard(
            `${course.department.code} ${course.courseNumber}`, 
            course.title
        );
        
        courseCard.addToContainer(coursesContainer);
    }
}

// Update pagination controls
function updatePagination() {
    // Limit to maxResults
    const totalResults = Math.min(filteredCourses.length, maxResults);
    const totalPages = Math.ceil(totalResults / coursesPerPage);
    
    // Update pagination info text
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    // Update button states
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages || totalPages <= 1;
}