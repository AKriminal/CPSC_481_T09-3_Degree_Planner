/**
 * course-popup.js - Handles the course detail popup functionality
 * Integrates with the existing CourseCard system to show course details
 */

// Embedded course data
const coursesData = [
    {
        "courseId": "CPSC217",
        "courseCode": "CPSC-217",
        "department": {
            "code": "CPSC",
            "name": "Computer Science"
        },
        "courseNumber": "217",
        "title": "Introduction to Computer Science for Multidisciplinary Studies I",
        "credits": 3,
        "level": 200,
        "description": "Introduction to problem solving, analysis and design of small-scale computational systems and implementation using a procedural programming language. For students wishing to combine studies in computer science with studies in other disciplines.",
        "prerequisites": null,
        "antirequisites": {
            "and": [
                "CPSC-217",
                {
                    "or": [
                        "CPSC-215",
                        "CPSC-231",
                        "CPSC-235",
                        "DATA-211",
                        "ENCM-339",
                        "ENG-233",
                        "ENDG-233"
                    ]
                }
            ]
        },
        "notes": "See the statements at the beginning of the Computer Science entry.",
        "offeredIn": {
            "Fall": true,
            "Winter": false,
            "Spring": true,
            "Summer": false
        },
        "uniqueId": 1
    },
    {
        "courseId": "CPSC219",
        "courseCode": "CPSC-219",
        "department": {
            "code": "CPSC",
            "name": "Computer Science"
        },
        "courseNumber": "219",
        "title": "Introduction to Computer Science for Multidisciplinary Studies II",
        "credits": 3,
        "level": 200,
        "description": "Continuation of Introduction to Computer Science for Multidisciplinary Studies I. Emphasis on object-oriented analysis and design of small-scale computational systems and implementation using an object-oriented language. Issues of design, modularization and programming style will be emphasized.",
        "prerequisites": {
            "or": [
                "CPSC-217",
                "DATA-211"
            ]
        },
        "antirequisites": {
            "and": [
                "CPSC-219",
                {
                    "or": [
                        "CPSC-233",
                        "CPSC-235",
                        "ENEL-497",
                        "ENCM-493"
                    ]
                }
            ]
        },
        "notes": "",
        "offeredIn": {
            "Fall": true,
            "Winter": true,
            "Spring": false,
            "Summer": true
        },
        "uniqueId": 2
    },
    {
        "courseId": "CPSC231",
        "courseCode": "CPSC-231",
        "department": {
            "code": "CPSC",
            "name": "Computer Science"
        },
        "courseNumber": "231",
        "title": "Introduction to Computer Science for Computer Science Majors I",
        "credits": 3,
        "level": 200,
        "description": "Introduction to problem solving, the analysis and design of small-scale computational systems, and implementation using a procedural programming language. For computer science majors.",
        "prerequisites": {
            "or": [
                "Admission to CPSC",
                "Bioinformatics",
                "Natural Science with a primary concentration in CPSC"
            ]
        },
        "antirequisites": {
            "and": [
                "CPSC-231",
                {
                    "or": [
                        "CPSC-215",
                        "CPSC-217",
                        "CPSC-235",
                        "DATA-211",
                        "ENCM-339",
                        "ENG-233",
                        "ENDG-233"
                    ]
                }
            ]
        },
        "notes": "See the statements at the beginning of the Computer Science entry.",
        "offeredIn": {
            "Fall": true,
            "Winter": false,
            "Spring": true,
            "Summer": false
        },
        "uniqueId": 3
    },
    {
        "courseId": "MATH211",
        "courseCode": "MATH-211",
        "department": {
            "code": "MATH",
            "name": "Mathematics"
        },
        "courseNumber": "211",
        "title": "Linear Methods I",
        "credits": 3,
        "level": 200,
        "description": "An introduction to systems of linear equations, vectors in Euclidean space and matrix algebra. Additional topics include linear transformations, determinants, complex numbers, eigenvalues, and applications.",
        "prerequisites": {
            "or": [
                "MATH-30-1",
                "MATH-212",
                "MATH-2"
            ]
        },
        "antirequisites": {
            "and": [
                "MATH-211",
                "MATH-213"
            ]
        },
        "notes": "",
        "offeredIn": {
            "Fall": true,
            "Winter": true,
            "Spring": true,
            "Summer": false
        },
        "uniqueId": 70
    }
];

// Initialize the popup system
function initializeCoursePopup() {
    // Create popup container if it doesn't exist
    if (!document.getElementById('course-popup-container')) {
        const popupContainer = document.createElement('div');
        popupContainer.id = 'course-popup-container';
        document.body.appendChild(popupContainer);
    }

    addPopupStyles();
    
    // Ensure the showCoursePopup function is globally available
    window.showCoursePopup = showCoursePopup;
}

// Function to show course popup - making it globally accessible
function showCoursePopup(courseCode) {
    // Find the course in our data
    const course = findCourseByCode(courseCode);
    
    if (!course) {
        console.error(`Course with code ${courseCode} not found in data`);
        alert(`Course details for ${courseCode} not available.`);
        return;
    }
    
    // Create popup HTML
    const popupHTML = createPopupHTML(course);
    
    // Get the popup container
    let popupContainer = document.getElementById('course-popup-container');
    if (!popupContainer) {
        console.error('Popup container not found, creating it now');
        popupContainer = document.createElement('div');
        popupContainer.id = 'course-popup-container';
        document.body.appendChild(popupContainer);
    }
    
    popupContainer.innerHTML = popupHTML;
    
    // Show the popup
    popupContainer.classList.add('active');
    
    // Add event listener for close button
    const closeButtons = popupContainer.querySelectorAll('.popup-close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', closePopup);
    });
    
    // Add event listener for clicking outside
    popupContainer.addEventListener('click', (event) => {
        if (event.target === popupContainer) {
            closePopup();
        }
    });
    
    // Add key event listener for ESC
    document.addEventListener('keydown', handleEscKey);
}

// Function to close the popup
function closePopup() {
    const popupContainer = document.getElementById('course-popup-container');
    if (popupContainer) {
        popupContainer.classList.remove('active');
        popupContainer.innerHTML = ''; // Clear content
    }
    
    // Remove ESC key event listener
    document.removeEventListener('keydown', handleEscKey);
}

// Handle ESC key press
function handleEscKey(event) {
    if (event.key === 'Escape') {
        closePopup();
    }
}

// Function to find course by code
function findCourseByCode(code) {
    // Normalize the code format (remove dashes and make uppercase)
    const normalizedSearchCode = code.replace('-', '').toUpperCase();
    
    // Find the matching course
    return coursesData.find(course => {
        if (!course) return false;
        
        const normalizedCourseCode = course.courseCode ? 
            course.courseCode.replace('-', '').toUpperCase() : '';
        const courseId = course.courseId ? 
            course.courseId.toUpperCase() : '';
            
        return normalizedCourseCode === normalizedSearchCode || 
               courseId === normalizedSearchCode;
    });
}

// Helper function to format prerequisites and antirequisites
function formatRequisites(req, isAnti = false) {
    if (!req) return '<span class="text-muted fst-italic">None</span>';
    
    if (typeof req === 'string') {
        return `<span class="badge ${isAnti ? 'bg-danger-soft' : 'bg-primary-soft'} me-1">${req}</span>`;
    }
    
    let html = '';
    
    if (req.and) {
        html += '<div class="requisite-group">';
        html += '<div class="requisite-header">Must satisfy ALL of the following:</div>';
        html += '<div class="ps-3 border-start border-2 border-gray mb-2">';
        
        req.and.forEach((item, index) => {
            html += formatRequisites(item, isAnti);
            if (index < req.and.length - 1) html += '<br>';
        });
        
        html += '</div></div>';
    }
    
    if (req.or) {
        html += '<div class="requisite-group">';
        html += '<div class="requisite-header">Must satisfy ONE of the following:</div>';
        html += '<div class="d-flex flex-wrap gap-2">';
        
        req.or.forEach(item => {
            html += formatRequisites(item, isAnti);
        });
        
        html += '</div></div>';
    }
    
    return html;
}

// Helper function to format offered terms
function formatOfferedTerms(offeredIn) {
    if (!offeredIn) return "Not specified";
    
    let html = '<div class="d-flex flex-wrap gap-2">';
    
    const terms = [
        { key: 'Fall', label: 'Fall' },
        { key: 'Winter', label: 'Winter' },
        { key: 'Spring', label: 'Spring' },
        { key: 'Summer', label: 'Summer' }
    ];
    
    terms.forEach(term => {
        const isOffered = offeredIn[term.key];
        html += `<div class="badge ${isOffered ? 'bg-success-soft' : 'bg-light text-decoration-line-through'}">${term.label}</div>`;
    });
    
    html += '</div>';
    
    return html;
}

// Function to create popup HTML
function createPopupHTML(course) {
    return `
    <div class="course-popup-overlay">
        <div class="course-popup-content">
            <!-- Header -->
            <div class="popup-header">
                <button class="popup-close-button" aria-label="Close">&times;</button>
                <h2>${course.courseCode}</h2>
                <h3>${course.title}</h3>
                <div class="d-flex align-items-center">
                    <div class="badge bg-primary me-2">${course.credits} Credits</div>
                    <div class="text-light opacity-75">Level ${course.level} • ${course.department.name}</div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="popup-body">
                <!-- Description -->
                <div class="popup-section">
                    <h4>Description</h4>
                    <p>${course.description}</p>
                </div>
                
                <!-- Prerequisites -->
                <div class="popup-section bg-light p-3 rounded">
                    <div class="d-flex align-items-center mb-2">
                        <svg class="icon-check me-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h4 class="mb-0">Prerequisites</h4>
                    </div>
                    <div class="ps-2">
                        ${formatRequisites(course.prerequisites)}
                    </div>
                    ${!course.prerequisites ? 
                        '<p class="text-muted mt-2 small">This course has no prerequisites. It\'s open to all students.</p>' : ''}
                </div>
                
                <!-- Antirequisites -->
                <div class="popup-section bg-light p-3 rounded">
                    <div class="d-flex align-items-center mb-2">
                        <svg class="icon-alert me-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h4 class="mb-0">Antirequisites</h4>
                    </div>
                    <div class="ps-2">
                        ${formatRequisites(course.antirequisites, true)}
                    </div>
                    <p class="text-muted mt-2 small">
                        You cannot receive credit for this course if you have already taken the antirequisite courses.
                    </p>
                </div>
                
                <!-- Offered In -->
                <div class="popup-section">
                    <h4>Offered In</h4>
                    ${formatOfferedTerms(course.offeredIn || course.offeredIn)}
                </div>
                
                <!-- Notes -->
                ${course.notes ? `
                <div class="popup-section">
                    <h4>Notes</h4>
                    <div class="bg-warning-soft p-3 rounded border-start border-4 border-warning">
                        ${course.notes}
                    </div>
                </div>` : ''}
            </div>
            
            <!-- Footer -->
            <div class="popup-footer">
                <button class="btn btn-secondary popup-close-button">Close</button>
            </div>
        </div>
    </div>
    `;
}

// Add CSS for the popup
function addPopupStyles() {
    // Check if styles are already added
    if (document.getElementById('course-popup-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'course-popup-styles';
    styleElement.textContent = `
        #course-popup-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1050;
        }
        
        #course-popup-container.active {
            display: block;
        }
        
        .course-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .course-popup-content {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .popup-header {
            background-color: #d6001c;
            color: white;
            padding: 1.5rem;
            position: relative;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }
        
        .popup-header h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0;
        }
        
        .popup-header h3 {
            font-size: 1.25rem;
            margin: 0.25rem 0 0.75rem 0;
        }
        
        .popup-close-button {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: transparent;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .popup-footer .popup-close-button {
            position: static;
            color: inherit;
            font-size: inherit;
            width: auto;
            height: auto;
            border-radius: 0.25rem;
            padding: 0.375rem 0.75rem;
            background-color: #e2e8f0;
        }
        
        .popup-close-button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .popup-footer .popup-close-button:hover {
            background-color: #cbd5e0;
        }
        
        .popup-body {
            padding: 1.5rem;
            overflow-y: auto;
        }
        
        .popup-section {
            margin-bottom: 1.5rem;
        }
        
        .popup-section h4 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 0.5rem;
            color: #2d3748;
        }
        
        .popup-footer {
            padding: 1rem 1.5rem;
            background-color: #f7fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
        }
        
        .badge {
            display: inline-block;
            padding: 0.35em 0.65em;
            font-size: 0.75em;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
        }
        
        .bg-primary {
            background-color: #3182ce;
            color: white;
        }
        
        .bg-primary-soft {
            background-color: #ebf8ff;
            color: #2c5282;
        }
        
        .bg-danger-soft {
            background-color: #fff5f5;
            color: #c53030;
        }
        
        .bg-success-soft {
            background-color: #f0fff4;
            color: #276749;
        }
        
        .bg-warning-soft {
            background-color: #fffaf0;
            color: #744210;
        }
        
        .bg-light {
            background-color: #edf2f7;
            color: #4a5568;
        }
        
        .text-muted {
            color: #718096;
        }
        
        .border-start {
            border-left: 1px solid;
        }
        
        .border-2 {
            border-width: 2px !important;
        }
        
        .border-4 {
            border-width: 4px !important;
        }
        
        .border-gray {
            border-color: #cbd5e0;
        }
        
        .border-warning {
            border-color: #ed8936;
        }
        
        .fst-italic {
            font-style: italic;
        }
        
        .ps-2 {
            padding-left: 0.5rem;
        }
        
        .ps-3 {
            padding-left: 1rem;
        }
        
        .me-1 {
            margin-right: 0.25rem;
        }
        
        .me-2 {
            margin-right: 0.5rem;
        }
        
        .mt-2 {
            margin-top: 0.5rem;
        }
        
        .mb-0 {
            margin-bottom: 0;
        }
        
        .mb-2 {
            margin-bottom: 0.5rem;
        }
        
        .p-3 {
            padding: 1rem;
        }
        
        .rounded {
            border-radius: 0.25rem;
        }
        
        .d-flex {
            display: flex;
        }
        
        .align-items-center {
            align-items: center;
        }
        
        .flex-wrap {
            flex-wrap: wrap;
        }
        
        .gap-2 {
            gap: 0.5rem;
        }
        
        .small {
            font-size: 0.875em;
        }
        
        .text-decoration-line-through {
            text-decoration: line-through;
        }
        
        .requisite-group {
            margin-bottom: 0.75rem;
        }
        
        .requisite-header {
            font-weight: 500;
            margin-bottom: 0.25rem;
            color: #4a5568;
        }
        
        .icon-check {
            color: #3182ce;
        }
        
        .icon-alert {
            color: #e53e3e;
        }
        
        /* Utility classes */
        .text-light {
            color: white;
        }
        
        .opacity-75 {
            opacity: 0.75;
        }
        
        .btn {
            display: inline-block;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
        }
        
        .btn-secondary {
            background-color: #718096;
            border-color: #718096;
            color: white;
        }
        
        .btn-secondary:hover {
            background-color: #4a5568;
            border-color: #4a5568;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Make sure showCoursePopup is globally available
window.showCoursePopup = showCoursePopup;
window.initializeCoursePopup = initializeCoursePopup;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addPopupStyles();
    initializeCoursePopup();
});

// Add a direct click handler for course codes in case the class integration fails
document.addEventListener('click', (event) => {
    if (event.target.matches('.course-code')) {
        const courseCode = event.target.textContent;
        window.showCoursePopup(courseCode);
    }
});
