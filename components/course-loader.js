// Helper functions for loading and rendering course data

// Define required courses by year
const REQUIRED_COURSES_BY_YEAR = {
    "1": ["CPSC231", "MATH211", "MATH249", "CPSC233", "CPSC251", "PHIL279"], // Year 1 required courses
    "2": ["CPSC351", "CPSC331", "CPSC355", "PHIL314", "SENG300"], // Year 2
    "3": ["CPSC413", "CPSC449", "CPSC457"], // Year 3
    "4": [] // Year 4
};

// Cache for courses data to avoid repeated fetching
let coursesCache = null;

/**
 * Fetch courses data from JSON file
 * @returns {Promise} Promise object representing courses data
 */
async function fetchCoursesData() {
    if (coursesCache) {
        return coursesCache;
    }
    
    try {
        const response = await fetch('components/courses.json');
        if (!response.ok) {
            throw new Error('Failed to fetch courses data');
        }
        
        const data = await response.json();
        coursesCache = data;
        return data;
    } catch (error) {
        console.error('Error loading courses data:', error);
        return [];
    }
}

/**
 * Find course by ID from courses list
 * @param {Array} courses - List of course objects
 * @param {String} courseId - Course ID to find
 * @returns {Object|null} Course object or null if not found
 */
function findCourseById(courses, courseId) {
    return courses.find(course => course.courseId === courseId) || null;
}

/**
 * Load required courses for a specific year
 * @param {Number} year - Academic year (1-4)
 * @returns {Promise} Promise object representing required courses for that year
 */
async function loadRequiredCoursesByYear(year) {
    const yearStr = year.toString();
    if (!REQUIRED_COURSES_BY_YEAR[yearStr]) {
        return [];
    }
    
    const courses = await fetchCoursesData();
    const requiredCourseIds = REQUIRED_COURSES_BY_YEAR[yearStr];
    
    return requiredCourseIds
        .map(courseId => findCourseById(courses, courseId))
        .filter(course => course !== null);
}

/**
 * Update progress trackers for all years
 */
function updateProgressTrackers() {
    Object.keys(REQUIRED_COURSES_BY_YEAR).forEach(year => {
        const yearContainer = document.querySelector(`.year-container[data-year="${year}"]`);
        if (!yearContainer) return;
        
        const totalRequired = REQUIRED_COURSES_BY_YEAR[year].length;
        const completedCount = document.querySelectorAll(`#year${year}-courses .status-select.completed`).length;
        const inProgressCount = document.querySelectorAll(`#year${year}-courses .status-select.in-progress`).length;
        const plannedCount = document.querySelectorAll(`#year${year}-courses .status-select.planned`).length;
        
        const remainingCount = totalRequired - completedCount - inProgressCount - plannedCount;
        
        const progressTracker = yearContainer.querySelector('.progress-tracker');
        if (progressTracker) {
            progressTracker.textContent = `${remainingCount} remaining`;
            
            // Change color based on status
            if (remainingCount === 0) {
                progressTracker.style.backgroundColor = '#E8F5E9';
                progressTracker.style.color = '#2E7D32';
            } else {
                progressTracker.style.backgroundColor = '#FFF3E0';
                progressTracker.style.color = '#E65100';
            }
        }
    });
}

/**
 * Load and render all required courses for all years
 */
async function loadAllRequiredCourses() {
    // Load each year's courses
    for (let year = 1; year <= 4; year++) {
        const yearContainer = document.getElementById(`year${year}-courses`);
        if (!yearContainer) continue;
        
        // Clear existing content
        yearContainer.innerHTML = '';
        
        // Get required courses for this year
        const courses = await loadRequiredCoursesByYear(year);
        
        if (courses.length === 0) {
            // Show empty message if no courses
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = 'No required courses for this year';
            yearContainer.appendChild(emptyMsg);
        } else {
            // Create and add course cards
            courses.forEach(course => {
                const courseCard = new CourseCard(course.courseId, course.title, true);
                courseCard.addToContainer(yearContainer);
            });
        }
    }
    
    // Update progress trackers
    updateProgressTrackers();
}

// Export functions for use in other scripts
window.CourseLoader = {
    loadAllRequiredCourses,
    updateProgressTrackers,
    getRequiredCoursesByYear: year => REQUIRED_COURSES_BY_YEAR[year.toString()] || []
};