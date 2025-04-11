/**
 * CourseCard - Represents a course card in the UI with various states
 * Handles user interactions and state transitions for course planning
 */
class CourseCard {
    constructor(code, title, isRequired = true) {
        this.code = code;
        this.title = title;
        this.isRequired = isRequired;
        this.selectedTerm = "";
        this.currentState = "initial"; // initial, selected, planned
        this.currentStatus = "none";
        
        // Create the card element
        this.cardElement = this.#createInitialCard();
        this.selectedCardElement = null;
        this.plannedCardElement = null;
        
        // Setup event listeners
        this.#setupEventListeners();
        
        // Initialize from saved data if available
        this.initializeFromSavedData();
    }

    #createInitialCard() {
        const template = document.getElementById('course-card-template');
        const card = document.importNode(template.content, true).firstElementChild;
        
        // Set basic info
        card.querySelector('.course-code').textContent = this.code;
        card.querySelector('.course-title').textContent = this.title;
        
        // Populate term dropdown (will be populated on click now)
        const dropdown = card.querySelector('.term-dropdown');
        dropdown.innerHTML = ''; // Clear placeholder terms
        
        // Store reference to this CourseCard instance
        card._courseCard = this;
        
        return card;
    }

    #createSelectedCard() {
        // Clone the initial card to keep the same structure
        const selectedCard = this.cardElement.cloneNode(true);
        
        // Update the term button to show the selected term and add active class
        const termButton = selectedCard.querySelector('.select-term');
        termButton.textContent = this.selectedTerm;
        termButton.classList.add('active');
        
        // Term dropdown will be repopulated dynamically when clicked
        const dropdown = selectedCard.querySelector('.term-dropdown');
        dropdown.innerHTML = ''; // Clear existing options
        
        // Re-add event listeners
        selectedCard.querySelector('.course-code').addEventListener('click', () => this.#showCourseDetails());
        selectedCard.querySelector('.select-term').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.#loadAvailableTermsAndToggleDropdown();
        });
        selectedCard.querySelector('.add-button').addEventListener('click', () => this.#addCourse());
        selectedCard.querySelector('.status-select').addEventListener('change', (e) => this.#changeStatus(e.target.value));
        
        // Enable the add button
        selectedCard.querySelector('.add-button').disabled = false;
        
        // Store reference to this CourseCard instance
        selectedCard._courseCard = this;
        
        return selectedCard;
    }

    #createPlannedCard() {
        const template = document.getElementById('planned-course-template');
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
        plannedCard.querySelector('.remove-button').addEventListener('click', () => this.#removeCourse());
        
        // Store reference to this CourseCard instance
        plannedCard._courseCard = this;
        
        return plannedCard;
    }

    #setupEventListeners() {
        // Course code click
        this.cardElement.querySelector('.course-code').addEventListener('click', () => this.#showCourseDetails());
        
        // Term dropdown toggle - now loads available terms on click
        this.cardElement.querySelector('.select-term').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.#loadAvailableTermsAndToggleDropdown();
        });
        
        // Status change
        this.cardElement.querySelector('.status-select').addEventListener('change', (e) => this.#changeStatus(e.target.value));
        
        // Add button is disabled initially
        const addButton = this.cardElement.querySelector('.add-button');
        if (addButton) {
            addButton.addEventListener('click', () => this.#addCourse());
            addButton.disabled = true;
        }
    }

    #showCourseDetails() {
        alert(`Future feature: Show details for ${this.code}`);
    }

    // Modified loadAvailableTermsAndToggleDropdown method
    #loadAvailableTermsAndToggleDropdown() {
        // First close all dropdowns and reset card z-index
        document.querySelectorAll('.term-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
            const parentCard = dropdown.closest('.course-card');
            if (parentCard) {
                parentCard.classList.remove('dropdown-active');
            }
        });
        
        // Get all available semesters from semester cards
        const currentCard = this.cardElement;
        const dropdown = currentCard.querySelector('.term-dropdown');
        
        // Clear existing options
        dropdown.innerHTML = '';
        
        // Get all semester cards and their names
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
            option.className = 'term-option';
            option.textContent = term;
            option.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.#selectTerm(term);
                
                // Remove active class from the card
                currentCard.classList.remove('dropdown-active');
            });
            dropdown.appendChild(option);
        });
        
        // If no semester options available, add a message
        if (availableSemesters.length === 0) {
            const noOption = document.createElement('div');
            noOption.className = 'term-option no-options';
            noOption.textContent = 'No semesters available';
            dropdown.appendChild(noOption);
        }
        
        // Toggle the dropdown visibility
        dropdown.classList.toggle('show');
        
        // Toggle active class for the card to control z-index
        currentCard.classList.toggle('dropdown-active');
    }

    // selectTerm method
    #selectTerm(term) {
        this.selectedTerm = term;
        
        // Hide dropdown
        const dropdown = this.cardElement.querySelector('.term-dropdown');
        dropdown.classList.remove('show');
        
        // Remove active class from card
        this.cardElement.classList.remove('dropdown-active');
        
        // Switch to selected state
        if (this.currentState === "initial") {
            this.currentState = "selected";
            
            // Create selected state card if not exists
            if (!this.selectedCardElement) {
                this.selectedCardElement = this.#createSelectedCard();
            } else {
                // Update the existing selected card
                this.selectedCardElement.querySelector('.select-term').textContent = term;
            }
            
            // Replace card element in DOM
            this.cardElement.parentNode.replaceChild(this.selectedCardElement, this.cardElement);
            this.cardElement = this.selectedCardElement;
        } else if (this.currentState === "selected") {
            // Just update the button text
            this.cardElement.querySelector('.select-term').textContent = term;
        }
        
        // Save term to storage if not in initial state
        if (this.currentState !== "initial" && window.CourseDataManager) {
            window.CourseDataManager.saveCourseTerm(this.code, term);
        }
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

    // Add this to course-card.js (replace the existing #addCourse method)
    #addCourse() {
        this.currentState = "planned";
        
        // Create planned state card if not exists
        if (!this.plannedCardElement) {
            this.plannedCardElement = this.#createPlannedCard();
        } else {
            // Update the existing planned card
            this.plannedCardElement.querySelector('.planned-tag').textContent = `Planned: ${this.selectedTerm}`;
        }
        
        // Set status to planned by default when adding
        this.currentStatus = "planned";
        
        // Replace card element in DOM
        this.cardElement.parentNode.replaceChild(this.plannedCardElement, this.cardElement);
        this.cardElement = this.plannedCardElement;
        
        // Save course data using the manager
        if (window.CourseDataManager) {
            window.CourseDataManager.saveCourse({
                code: this.code,
                title: this.title,
                term: this.selectedTerm,
                status: this.currentStatus,
                credits: 3 // Default credits - you might want to get this from course data
            });
            
            // Explicitly trigger semester view update
            if (typeof window.updateSemesterCourses === 'function') {
                window.updateSemesterCourses(this.selectedTerm);
            }
        }
        
        // Update progress trackers if available
        if (typeof window.CourseLoader !== 'undefined') {
            window.CourseLoader.updateProgressTrackers();
        }
    }
    #removeCourse() {
        this.currentState = "initial";
        this.selectedTerm = "";
        this.currentStatus = "none";
        
        // Remove course data
        if (window.CourseDataManager) {
            window.CourseDataManager.removeCourseData(this.code);
        }
        
        // Recreate initial card
        const newInitialCard = this.#createInitialCard();
        
        // Replace card element in DOM
        this.cardElement.parentNode.replaceChild(newInitialCard, this.cardElement);
        this.cardElement = newInitialCard;
        
        // Reset selected and planned card references
        this.selectedCardElement = null;
        this.plannedCardElement = null;
        
        // Re-setup event listeners
        this.#setupEventListeners();
        
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
                this.#selectTerm(courseData.term);
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

// Move course functionality for use externally
function setupMoveCourseEvents() {
    $(document).on('click', '.move-course', function() {
        const courseItem = $(this).closest('.course-item');
        const currentSemester = courseItem.closest('.semester-card');
        const allSemesters = $('.semester-card').not(currentSemester);
        
        let moveOptionsHTML = '';
        allSemesters.each(function() {
            const semesterName = $(this).find('h6').text();
            moveOptionsHTML += `<option value="${semesterName}">${semesterName}</option>`;
        });
        
        if (moveOptionsHTML === '') {
            alert("No other semesters available to move this course to.");
            return;
        }
        
        // Create move dialog if it doesn't exist
        if ($('#semester-move-overlay').length === 0) {
            $('body').append(`
                <div id="semester-move-overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000;">
                    <div id="semester-move-dialog" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1);">
                        <h5>Move Course</h5>
                        <p>Select a semester to move this course to:</p>
                        <select id="move-semester-select" class="form-select mb-3">
                            ${moveOptionsHTML}
                        </select>
                        <div class="d-flex justify-content-end">
                            <button id="cancel-move" class="btn btn-secondary me-2">Cancel</button>
                            <button id="confirm-move" class="btn btn-primary">Move</button>
                        </div>
                    </div>
                </div>
            `);
            
            // Add event listeners for the dialog buttons
            $(document).on('click', '#cancel-move', function() {
                $('#semester-move-overlay').hide();
            });
            
            $(document).on('click', '#semester-move-overlay', function(e) {
                if ($(e.target).is('#semester-move-overlay')) {
                    $('#semester-move-overlay').hide();
                }
            });
        } else {
            // Just update the options if dialog already exists
            $('#move-semester-select').html(moveOptionsHTML);
        }
        
        // Store reference to course being moved
        window.currentMoveCourse = courseItem;
        
        // Show dialog
        $('#semester-move-overlay').show();
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    // Only close dropdowns if the click wasn't on a select-term button
    if (!event.target.matches('.select-term') && !event.target.matches('.term-option')) {
        document.querySelectorAll('.term-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
            // Remove active class from parent cards
            const parentCard = dropdown.closest('.course-card');
            if (parentCard) {
                parentCard.classList.remove('dropdown-active');
            }
        });
    }
});

// Make sure this code only runs if not already defined
if (typeof window.courseCardInitialized === 'undefined') {
    window.courseCardInitialized = true;
    
    // Setup the move course functionality when the DOM is ready
    if (typeof jQuery !== 'undefined') {
        $(document).ready(function() {
            setupMoveCourseEvents();
        });
    }
}

// If CourseLoader is defined, extend it to initialize cards with saved data
if (typeof window.CourseLoader !== 'undefined') {
    const originalLoadAllRequiredCourses = window.CourseLoader.loadAllRequiredCourses;
    
    window.CourseLoader.loadAllRequiredCourses = async function() {
        // Call original method first
        await originalLoadAllRequiredCourses();
        
        // Now find all course cards and initialize them from saved data
        document.querySelectorAll('.course-card').forEach(cardElement => {
            const courseCard = cardElement._courseCard;
            if (courseCard && typeof courseCard === 'object') {
                courseCard.initializeFromSavedData();
            }
        });
    };
    
    console.log('CourseLoader extended with data persistence');
}