/**
 * CoursePlaceholderContainer - Represents a placeholder that acts as a container for course cards
 * Now using the standard CourseCard component for consistent UI/UX
 */
class CoursePlaceholderContainer {
    constructor(placeholderType, requirement, maxCount = 4) {
        this.placeholderType = placeholderType; // e.g., "CS-FLD", "MATH-OPT"
        this.requirement = requirement; // e.g., "400 lvl or higher"
        this.maxCount = maxCount;
        this.courses = []; // Array to store added courses
        this.element = this.#createPlaceholderContainer();
        this.coursesContainer = this.element.querySelector('.courses-container');
        
        // Set up event listeners
        this.#setupEventListeners();
    }
    
    #createPlaceholderContainer() {
        // Create the placeholder container
        const container = document.createElement('div');
        container.className = 'course-card placeholder-card';
        container.innerHTML = `
            <div class="course-header">
                <div>
                    <span class="course-code">${this.placeholderType}</span>
                    <span class="placeholder-tag">${this.requirement}</span>
                    <span class="tooltip-icon" title="Click for more information">ⓘ</span>
                </div>
                <span class="placeholder-count">0/${this.maxCount}</span>
            </div>
            
            <div class="tooltip-content" style="display: none; margin-bottom: 10px; padding: 8px; background-color: #f0f7ff; border-radius: 4px; font-size: 0.9rem; color: #333;">
                Click on "+ Select Course" to add courses to this requirement.
            </div>
            
            <div class="courses-container" style="margin: 10px 0;"></div>
            
            <button class="select-course-button">+ Select Course</button>
        `;
        container.setAttribute('data-type', this.placeholderType);
        return container;
    }
    
    #setupEventListeners() {
        // Add click event for the select course button
        const selectButton = this.element.querySelector('.select-course-button');
        selectButton.addEventListener('click', () => this.#handleSelectCourse());
        
        // Add toggle for tooltip
        const tooltipIcon = this.element.querySelector('.tooltip-icon');
        const tooltipContent = this.element.querySelector('.tooltip-content');
        
        tooltipIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltipContent.style.display = tooltipContent.style.display === 'none' ? 'block' : 'none';
        });
        
        // Style the tooltip icon
        tooltipIcon.style.cssText = `
            cursor: pointer;
            color: #1d4ed8;
            margin-left: 5px;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #e6f0ff;
        `;
    }
    
    // Add a public method to update tooltip content
    addTooltip(content) {
        const tooltipContent = this.element.querySelector('.tooltip-content');
        if (tooltipContent) {
            // Add the custom content
            tooltipContent.innerHTML = `
                <p>${content}</p>
                <p style="margin-top: 8px; font-style: italic;">Click on "+ Select Course" to add courses to this requirement.</p>
            `;
        }
    }
    
    #handleSelectCourse() {
        // Check if maximum number of courses has been reached
        if (this.courses.length >= this.maxCount) {
            alert(`Maximum number of courses (${this.maxCount}) has been reached for this placeholder.`);
            return;
        }
        
        // Prompt the user for a course code
        const courseCode = prompt("Enter course code (e.g., CPSC331):");
        
        if (!courseCode) return; // User cancelled
        
        // Validate the course code format (basic validation)
        if (!/^[A-Z]{4}\d{3}$/.test(courseCode)) {
            alert("Invalid course code format. Please use format like CPSC331.");
            return;
        }
        
        // Get course details and add it to the container
        this.#loadCourseDetails(courseCode);
    }
    
    async #loadCourseDetails(courseCode) {
        try {
            // Check if course already exists in this placeholder
            if (this.courses.some(course => course.code === courseCode)) {
                alert(`Course ${courseCode} is already added to this placeholder.`);
                return;
            }
            
            // Use existing CourseLoader to fetch course data
            const coursesData = await fetchCoursesData();
            const course = findCourseById(coursesData, courseCode);
            
            if (!course) {
                alert(`Course ${courseCode} not found in the database.`);
                return;
            }
            
            // Add the course to this placeholder using the standard CourseCard
            this.#addCourseToPlaceholder(course);
            
            // Update the counter display
            this.#updateCounter();
            
        } catch (error) {
            console.error('Error loading course details:', error);
            alert('Failed to load course details. Please try again.');
        }
    }
    
    #addCourseToPlaceholder(course) {
        // Create a standard CourseCard instance (not required course)
        const courseCard = new CourseCard(course.courseId, course.title, false);
        
        // Store reference to the course card element
        const courseElement = courseCard.cardElement;
        
        // Create a wrapper for the course card and actions
        const courseWrapper = document.createElement('div');
        courseWrapper.className = 'course-wrapper';
        courseWrapper.style.cssText = `
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            position: relative;
        `;
        
        // Modify the card to fit within the placeholder container
        courseElement.style.flexGrow = '1';
        courseElement.style.borderLeft = '3px solid #1d4ed8'; // Match placeholder color
        courseElement.style.padding = '12px 15px'; // Slightly more compact
        
        // Remove the "Required Course" badge if present
        const requiredBadge = courseElement.querySelector('.badge-required');
        if (requiredBadge) {
            requiredBadge.remove();
        }
        
        // Add a custom class for styling
        courseElement.classList.add('placeholder-course-card');
        
        // Create the three-dots menu button
        const menuButton = document.createElement('button');
        menuButton.className = 'course-action-menu-btn';
        menuButton.innerHTML = '⋮'; // Three vertical dots
        menuButton.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            font-weight: bold;
            color: #666;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            margin-left: 5px;
            margin-top: 10px;
        `;
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'course-action-dropdown';
        dropdownMenu.style.cssText = `
            position: absolute;
            right: 0;
            top: 100%;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 10;
            min-width: 120px;
            display: none;
        `;
        
        // Add menu options
        dropdownMenu.innerHTML = `
            <div class="menu-item swap-course" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;">
                <i class="fas fa-exchange-alt" style="margin-right: 8px;"></i> Swap Course
            </div>
            <div class="menu-item delete-course" style="padding: 8px 12px; cursor: pointer; color: #e74c3c;">
                <i class="fas fa-trash" style="margin-right: 8px;"></i> Delete Course
            </div>
        `;
        
        // Add event listeners for the menu
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });
        
        // Stop propagation on dropdown click
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Add event listeners for menu items
        dropdownMenu.querySelector('.swap-course').addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
            this.#removeCourse(course.courseId);
            // Trigger the select course prompt again
            this.#handleSelectCourse();
        });
        
        dropdownMenu.querySelector('.delete-course').addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
            this.#removeCourse(course.courseId);
        });
        
        // Append action button and dropdown
        const actionContainer = document.createElement('div');
        actionContainer.className = 'course-action-container';
        actionContainer.style.position = 'relative';
        actionContainer.appendChild(menuButton);
        actionContainer.appendChild(dropdownMenu);
        
        // Add to wrapper
        courseWrapper.appendChild(courseElement);
        courseWrapper.appendChild(actionContainer);
        
        // Add to internal courses array
        this.courses.push({
            code: course.courseId,
            title: course.title,
            element: courseWrapper,
            cardInstance: courseCard
        });
        
        // Add to the DOM
        this.coursesContainer.appendChild(courseWrapper);
        
        // Hide the tooltip content when a course is added
        const tooltipContent = this.element.querySelector('.tooltip-content');
        if (tooltipContent) {
            tooltipContent.style.display = 'none';
        }
        
        // Hide the select button if max reached
        if (this.courses.length >= this.maxCount) {
            this.element.querySelector('.select-course-button').style.display = 'none';
        }
    }
    
    #removeCourse(courseCode) {
        // Find the course in our array
        const courseIndex = this.courses.findIndex(course => course.code === courseCode);
        
        if (courseIndex !== -1) {
            // Remove from DOM
            this.coursesContainer.removeChild(this.courses[courseIndex].element);
            
            // Remove from array
            this.courses.splice(courseIndex, 1);
            
            // Show the select button if previously hidden
            if (this.courses.length < this.maxCount) {
                this.element.querySelector('.select-course-button').style.display = 'block';
            }
            
            // Update counter
            this.#updateCounter();
        }
    }
    
    #updateCounter() {
        // Update the counter to show current/max
        const counterElement = this.element.querySelector('.placeholder-count');
        counterElement.textContent = `${this.courses.length}/${this.maxCount}`;
        
        // Change color based on fill status
        if (this.courses.length === this.maxCount) {
            counterElement.style.backgroundColor = '#4cd964';
            counterElement.style.color = 'white';
        } else if (this.courses.length > 0) {
            counterElement.style.backgroundColor = '#ffe5b4';
            counterElement.style.color = '#b45309';
        } else {
            counterElement.style.backgroundColor = '#f0f0f0';
            counterElement.style.color = '#666';
        }
    }
    
    // Public method to add this placeholder container to a parent container
    addToContainer(container) {
        container.appendChild(this.element);
    }
    
    // Public method to get the courses in this placeholder
    getCourses() {
        return this.courses.map(course => ({
            code: course.code,
            title: course.title,
            status: course.cardInstance?.currentStatus || 'none'
        }));
    }
}

// Helper function to find course by ID (similar to course-loader.js)
function findCourseById(courses, courseId) {
    return courses.find(course => course.courseId === courseId) || null;
}

// Helper function to fetch courses data (similar to course-loader.js)
async function fetchCoursesData() {
    // If the window.CourseLoader exists, use its data
    if (typeof window.CourseLoader !== 'undefined') {
        try {
            const courses = await fetch('components/courses.json').then(res => res.json());
            return courses;
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    }
    
    // Return a mock dataset for testing
    return [
        { courseId: "CPSC231", title: "Introduction to Computer Science for Computer Science Majors I" },
        { courseId: "CPSC233", title: "Introduction to Computer Science for Computer Science Majors II" },
        { courseId: "CPSC331", title: "Data Structures, Algorithms, and Their Analysis" },
        { courseId: "CPSC355", title: "Computing Machinery I" },
        { courseId: "CPSC413", title: "Design and Analysis of Algorithms I" },
        { courseId: "CPSC449", title: "Programming Paradigms" },
        { courseId: "CPSC457", title: "Principles of Operating Systems" },
        { courseId: "CPSC441", title: "Computer Networks" },
        { courseId: "CPSC471", title: "Data Base Management Systems" },
        { courseId: "CPSC481", title: "Human-Computer Interaction I" },
        { courseId: "MATH211", title: "Linear Methods I" },
        { courseId: "MATH271", title: "Discrete Mathematics" },
        { courseId: "ENGL201", title: "Literature: Transformative Narratives" },
        { courseId: "PSYC200", title: "Principles of Psychology" }
    ];
}