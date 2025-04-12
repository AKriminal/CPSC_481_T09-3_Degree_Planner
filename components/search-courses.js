$(document).ready(function() {
    // Global variables
    let allCourses = [];
    let filteredCourses = [];
    let currentPage = 1;
    const coursesPerPage = 4;

    // Initialize the page
    initializePage();

    async function initializePage() {
        try {
            // First try to load courses from JSON
            await loadCoursesFromJSON();
            
            // If JSON load failed or empty, use default courses
            if (allCourses.length === 0) {
                allCourses = getDefaultCourses();
            }
            
            filteredCourses = allCourses; // Show all courses initially
            displayCourses();
            updatePagination();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing page:', error);
            // Fallback to default courses
            allCourses = getDefaultCourses();
            filteredCourses = allCourses;
            displayCourses();
            updatePagination();
            setupEventListeners();
        }
    }

    function getDefaultCourses() {
        return [
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
    }

    async function loadCoursesFromJSON() {
        try {
            const response = await $.ajax({
                url: 'components/courses.json',
                dataType: 'json'
            });
            
            if (Array.isArray(response)) {
                allCourses = response; // Load all courses without any limit
            }
        } catch (error) {
            console.error('Error loading courses from JSON:', error);
            throw error; // Let the caller handle the error
        }
    }

    function displayCourses() {
        $('#search-courses-container').empty();
        
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = Math.min(startIndex + coursesPerPage, filteredCourses.length);
        
        if (filteredCourses.length === 0) {
            $('#search-courses-container').html('<div class="no-results">No courses found matching your criteria.</div>');
            return;
        }
        
        for (let i = startIndex; i < endIndex; i++) {
            const course = filteredCourses[i];
            const hasPrerequisites = course.prerequisites && 
                (course.prerequisites.and || course.prerequisites.or || Object.keys(course.prerequisites).length > 0);
            
            // Generate offered semesters string
            const offeredSemesters = [];
            if (course.offeredIn.Fall) offeredSemesters.push('Fall');
            if (course.offeredIn.Winter) offeredSemesters.push('Winter');
            if (course.offeredIn.Spring) offeredSemesters.push('Spring');
            if (course.offeredIn.Summer) offeredSemesters.push('Summer');
            
            const offeredString = offeredSemesters.length > 0 
                ? `Usually offered in: ${offeredSemesters.join(', ')}`
                : 'Not regularly offered';
            
            $('#search-courses-container').append(`
                <div class="course-item" data-course-id="${course.uniqueId}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: #0064A4;">${course.department.code} ${course.courseNumber}</div>
                        <span class="course-credits">${course.credits} credits</span>
                    </div>
                    <div style="padding: 5px 0;">${course.title}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <span class="semester-badge">${offeredString}</span>
                        <span class="status-badge ${hasPrerequisites ? 'bg-warning' : 'bg-success'}">
                            ${hasPrerequisites ? 'Prerequisites pending' : 'No prerequisites'}
                        </span>
                    </div>
                </div>
            `);
        }
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
        
        // Update pagination info text
        $('#pagination-info').text(`Page ${currentPage} of ${totalPages || 1}`);
        
        // Update button states
        $('#prevPage').prop('disabled', currentPage <= 1);
        $('#nextPage').prop('disabled', currentPage >= totalPages || totalPages <= 1);
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Apply filters button
        $('#applyFilters').on('click', applyFilters);
        
        // Search as you type
        $('#courseSearch').on('input', applyFilters);
        
        // Pagination buttons
        $('#prevPage').on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayCourses();
                updatePagination();
            }
        });
        
        $('#nextPage').on('click', function() {
            const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayCourses();
                updatePagination();
            }
        });
        
        // Active filter removal
        $('#activeFilters').on('click', '.filter-tag-close', function() {
            const filterType = $(this).data('filter');
            $(`#${filterType}Filter`).val('');
            $('#courseSearch').val('');
            applyFilters();
        });
        
        // Course selection
        $('#search-courses-container').on('click', '.course-item', function() {
            $(this).toggleClass('active').siblings().removeClass('active');
        });
    }
    window.applyFilters = applyFilters;
    // Apply all filters to the course list
    function applyFilters() {
        const searchTerm = $('#courseSearch').val().toLowerCase().trim();
        const faculty = $('#facultyFilter').val();
        const department = $('#departmentFilter').val();
        const level = $('#levelFilter').val();
        
        // Reset to page 1 when filtering
        currentPage = 1;
        
        // Filter courses without limiting the results
        filteredCourses = allCourses.filter(course => {
            // Create search-friendly versions of course codes
            const spacedCode = `${course.department.code} ${course.courseNumber}`.toLowerCase();
            const compactCode = `${course.department.code}${course.courseNumber}`.toLowerCase();
            const hyphenCode = `${course.department.code}-${course.courseNumber}`.toLowerCase();
            
            // Search term filter - matches any version of the course code
            const matchesSearch = !searchTerm || 
                course.title.toLowerCase().includes(searchTerm) || 
                spacedCode.includes(searchTerm) ||
                compactCode.includes(searchTerm) ||
                hyphenCode.includes(searchTerm);
            
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
        $('#activeFilters').empty();
        
        const faculty = $('#facultyFilter').val();
        const department = $('#departmentFilter').val();
        const level = $('#levelFilter').val();
        const searchTerm = $('#courseSearch').val().trim();
        
        if (searchTerm) {
            $('#activeFilters').append(`
                <div class="filter-tag">
                    Search: "${searchTerm}"
                    <span class="filter-tag-close" data-filter="course">✕</span>
                </div>
            `);
        }
        
        if (faculty) {
            $('#activeFilters').append(`
                <div class="filter-tag">
                    Faculty: ${faculty}
                    <span class="filter-tag-close" data-filter="faculty">✕</span>
                </div>
            `);
        }
        
        if (department) {
            $('#activeFilters').append(`
                <div class="filter-tag">
                    Department: ${department}
                    <span class="filter-tag-close" data-filter="department">✕</span>
                </div>
            `);
        }
        
        if (level) {
            $('#activeFilters').append(`
                <div class="filter-tag">
                    Level: ${level}
                    <span class="filter-tag-close" data-filter="level">✕</span>
                </div>
            `);
        }
    }
});
