/**
 * SearchCourseCard - Represents a course card in the search UI with various states
 * Handles user interactions and state transitions for course planning
 */
class SearchCourseCard {
    constructor(code, title, isFromPlaceholder = false) {
        this.code = code;
        this.title = title;
        this.isFromPlaceholder = isFromPlaceholder;
        this.selectedTerm = "";
        this.currentState = "initial"; // initial, planned
        this.currentStatus = "none";
        
        // Create the card element
        this.cardElement = this.#createInitialCard();
        this.plannedCardElement = null;
        
        // Setup event listeners
        this.#setupEventListeners();
        
        // Initialize from saved data if available
        this.initializeFromSavedData();
    }

    #createInitialCard() {
        const template = document.getElementById('search-course-card-template');
        const card = document.importNode(template.content, true).firstElementChild;
        
        // Set basic info
        card.querySelector('.course-code').textContent = this.code;
        card.querySelector('.course-title').textContent = this.title;
        
        // Empty dropdown container
        const dropdown = card.querySelector('.dropdown-menu');
        dropdown.innerHTML = '';
        
        // Store reference to this SearchCourseCard instance
        card._courseCard = this;
        
        return card;
    }

    #createPlannedCard() {
        const template = document.getElementById('search-planned-course-template');
        const plannedCard = document.importNode(template.content, true).firstElementChild;
        
        // Set basic info
        plannedCard.querySelector('.course-code').textContent = this.code;
        plannedCard.querySelector('.course-title').textContent = this.title;
        plannedCard.querySelector('.planned-tag').textContent = `Planned: ${this.selectedTerm}`;
        
        // Set status to planned
        const statusSelect = plannedCard.querySelector('.status-select');
        statusSelect.value = 'planned';
        statusSelect.className = 'status-select planned';
        
        // Add event listeners
        plannedCard.querySelector('.course-code').addEventListener('click', () => this.#showCourseDetails());
        plannedCard.querySelector('.status-select').addEventListener('change', (e) => this.#changeStatus(e.target.value));
        
        // Store reference to this SearchCourseCard instance
        plannedCard._courseCard = this;
        
        return plannedCard;
    }

    #setupEventListeners() {
        // Course code click
        this.cardElement.querySelector('.course-code').addEventListener('click', () => this.#showCourseDetails());
        
        // Action icon click
        const actionIcon = this.cardElement.querySelector('.action-icon');
        if (actionIcon) {
            actionIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isFromPlaceholder) {
                    this.#handlePlaceholderAction();
                } else {
                    this.#toggleSemesterDropdown();
                }
            });
        }
        
        // Status change
        this.cardElement.querySelector('.status-select').addEventListener('change', (e) => this.#changeStatus(e.target.value));
    }

    #showCourseDetails() {
        alert(`Future feature: Show details for ${this.code}`);
    }
    
    #handlePlaceholderAction() {
        // For placeholder page, simply return the course ID
        if (typeof window.onCourseSelected === 'function') {
            window.onCourseSelected(this.code, this.title);
        } else {
            console.log(`Course selected: ${this.code}`);
            alert(`You selected: ${this.code} - ${this.title}`);
        }
    }

    #toggleSemesterDropdown() {
        // First close all dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
            const parentCard = menu.closest('.course-card');
            if (parentCard) {
                parentCard.classList.remove('dropdown-active');
            }
        });
        
        const dropdown = this.cardElement.querySelector('.dropdown-menu');
        const semesterOptionsContainer = dropdown.querySelector('.semester-options');
        
        // Clear existing options
        semesterOptionsContainer.innerHTML = '';
        
        // Load available semesters
        let availableSemesters = [];
        
        // Look for semester cards in the DOM
        document.querySelectorAll('.semester-card').forEach(semesterCard => {
            const semesterName = semesterCard.querySelector('h6')?.textContent;
            if (semesterName) {
                availableSemesters.push(semesterName);
            }
        });
        
        // If no semester cards found, use fallback default semesters
        if (availableSemesters.length === 0) {
            availableSemesters = ['Fall 2025', 'Winter 2026', 'Spring 2026'];
        }
        
        // Create an option for each available semester
        availableSemesters.forEach(term => {
            const option = document.createElement('div');
            option.className = 'semester-option';
            option.textContent = term;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#selectTerm(term);
                dropdown.classList.remove('show');
                this.cardElement.classList.remove('dropdown-active');
            });
            semesterOptionsContainer.appendChild(option);
        });
        
        // If no semester options available, add a message
        if (availableSemesters.length === 0) {
            const noOption = document.createElement('div');
            noOption.className = 'semester-option';
            noOption.textContent = 'No semesters available';
            noOption.style.fontStyle = 'italic';
            noOption.style.color = '#adb5bd';
            semesterOptionsContainer.appendChild(noOption);
        }
        
        // Toggle the dropdown visibility
        dropdown.classList.toggle('show');
        
        // Toggle active class for the card to control z-index
        this.cardElement.classList.toggle('dropdown-active');
    }

    #selectTerm(term) {
        this.selectedTerm = term;
        
        // Hide dropdown
        const dropdown = this.cardElement.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        
        // Add course to the selected term
        this.#addCourse();
    }

    #changeStatus(status) {
        this.currentStatus = status;
        
        // Update status selector class
        const statusSelect = this.cardElement.querySelector('.status-select');
        statusSelect.value = status;
        statusSelect.className = 'status-select ' + status;
        
        // Save status to storage
        if (window.CourseDataManager) {
            window.CourseDataManager.saveCourseStatus(this.code, status);
        }
        
        // Update progress trackers if available
        if (typeof window.CourseLoader !== 'undefined') {
            window.CourseLoader.updateProgressTrackers();
        }
    }

    #addCourse() {
        this.currentState = "planned";
        
        // Create planned state card if not exists
        if (!this.plannedCardElement) {
            this.plannedCardElement = this.#createPlannedCard();
        } else {
            // Update the existing planned card
            const plannedTag = this.plannedCardElement.querySelector('.planned-tag');
            if (plannedTag) {
                plannedTag.textContent = `Planned: ${this.selectedTerm}`;
            }
        }
        
        // Set status to planned by default when adding
        this.currentStatus = "planned";
        
        // Replace card element in DOM
        this.cardElement.parentNode.replaceChild(this.plannedCardElement, this.cardElement);
        this.cardElement = this.plannedCardElement;
        
        // Save course data
        if (window.CourseDataHelper) {
            const credits = 3; // Default credits - you might want to get this from course data
            window.CourseDataHelper.addCourseToTerm(
                this.code,
                this.title,
                this.selectedTerm,
                this.currentStatus,
                credits
            );
            
            // Trigger UI update in year.html
            if (typeof window.updateSemesterCourses === 'function') {
                window.updateSemesterCourses(this.selectedTerm);
            }
        }
        
        // Update progress trackers if available
        if (typeof window.CourseLoader !== 'undefined') {
            window.CourseLoader.updateProgressTrackers();
        }
    }

    // Public method to add the card to a container
    addToContainer(container) {
        container.appendChild(this.cardElement);
    }
    
    // Public method to initialize from saved data
    initializeFromSavedData() {
        if (!window.CourseDataManager) return;
        
        const courseData = window.CourseDataManager.getCourseData(this.code);
        if (courseData) {
            // If we have saved data, set the term first
            if (courseData.term) {
                this.selectedTerm = courseData.term;
            }
            
            // If the status is not 'none' or we have a term, add the course to the plan
            if (courseData.status !== 'none' || courseData.term) {
                this.#addCourse();
                
                // Set the status if different from default
                if (courseData.status !== 'planned') {
                    this.#changeStatus(courseData.status);
                }
            }
        }
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    // Only close dropdowns if the click wasn't on an action icon
    if (!event.target.matches('.action-icon') && !event.target.matches('.semester-option')) {
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            dropdown.classList.remove('show');
            // Remove active class from parent cards
            const parentCard = dropdown.closest('.course-card');
            if (parentCard) {
                parentCard.classList.remove('dropdown-active');
            }
        });
    }
});

// Example usage:
// const container = document.getElementById('search-courses-container');
// 
// // Create a search course card with normal functionality
// const normalCard = new SearchCourseCard('CPSC 413', 'Design and Analysis of Algorithms I');
// normalCard.addToContainer(container);
// 
// // Create a search course card that comes from a placeholder page
// const placeholderCard = new SearchCourseCard('MATH 271', 'Discrete Mathematics', true);
// placeholderCard.addToContainer(container);