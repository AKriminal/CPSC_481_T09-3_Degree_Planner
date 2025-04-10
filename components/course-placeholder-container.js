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
                </div>
                <span class="placeholder-count">0/${this.maxCount}</span>
            </div>
            
            <div class="courses-container" style="margin: 10px 0;"></div>
            
            <button class="select-course-button">+ Select Course</button>
        `;
        
        return container;
    }
    
    #setupEventListeners() {
        // Add click event for the select course button
        const selectButton = this.element.querySelector('.select-course-button');
        selectButton.addEventListener('click', () => this.#handleSelectCourse());
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
        
        // Modify the card to fit within the placeholder container
        courseElement.style.marginBottom = '8px';
        courseElement.style.borderLeft = '3px solid #1d4ed8'; // Match placeholder color
        courseElement.style.padding = '12px 15px'; // Slightly more compact
        
        // Remove the "Required Course" badge if present
        const requiredBadge = courseElement.querySelector('.badge-required');
        if (requiredBadge) {
            requiredBadge.remove();
        }
        
        // Add a custom class for styling
        courseElement.classList.add('placeholder-course-card');
        
        // Add a remove button specifically for placeholder courses
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-course-btn';
        removeButton.innerHTML = '✕ Remove';
        removeButton.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 13px;
        `;
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.#removeCourse(course.courseId);
        });
        
        // Add the remove button to the card's action area
        const actionArea = courseElement.querySelector('.status-selector')?.parentElement;
        if (actionArea) {
            actionArea.appendChild(removeButton);
        }
        
        // Add to internal courses array
        this.courses.push({
            code: course.courseId,
            title: course.title,
            element: courseElement,
            cardInstance: courseCard
        });
        
        // Add to the DOM
        this.coursesContainer.appendChild(courseElement);
        
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
        { courseId: "CPSC481", title: "Human-Computer Interaction I" }
    ];
}