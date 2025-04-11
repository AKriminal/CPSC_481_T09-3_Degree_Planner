/**
 * Simple Course Selector Component
 * Provides a dropdown for selecting courses from the courses.json data
 */

class CourseSelector {
    constructor(options = {}) {
        this.courses = [];
        this.onSelect = options.onSelect || (() => {});
        this.modalId = 'course-selector-modal';
        this.init();
    }

    async init() {
        // Load course data
        this.courses = await this.fetchCoursesData();
        
        // Create modal HTML structure
        this.createModal();
        
        // Add event listeners
        this.setupEventListeners();
    }

    async fetchCoursesData() {
        try {
            const response = await fetch('components/courses.json');
            if (!response.ok) throw new Error('Failed to fetch courses data');
            return await response.json();
        } catch (error) {
            console.error('Error loading courses data:', error);
            return [];
        }
    }

    createModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById(this.modalId);
        if (existingModal) existingModal.remove();

        // Create modal container
        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Modal content
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h5 style="margin-top: 0;">Select Course</h5>
                <div style="margin-bottom: 15px;">
                    <input type="text" id="course-search" placeholder="Search courses..." 
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div id="course-list" style="max-height: 300px; overflow-y: auto;">
                    ${this.courses.map(course => `
                        <div class="course-option" data-code="${course.courseId}" 
                            style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer;">
                            <strong>${course.courseId}</strong> - ${course.title}
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <button id="cancel-select" style="
                        background: #f0f0f0;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 4px;
                        margin-right: 10px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    setupEventListeners() {
        const modal = document.getElementById(this.modalId);
        const searchInput = modal.querySelector('#course-search');
        const courseList = modal.querySelector('#course-list');
        const cancelBtn = modal.querySelector('#cancel-select');

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = courseList.querySelectorAll('.course-option');
            
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Course selection
        courseList.addEventListener('click', (e) => {
            const option = e.target.closest('.course-option');
            if (option) {
                const courseCode = option.dataset.code;
                const course = this.courses.find(c => c.courseId === courseCode);
                if (course) {
                    this.onSelect(course);
                    this.hide();
                }
            }
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => this.hide());
    }

    show() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.querySelector('#course-search').focus();
        }
    }

    hide() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.style.display = 'none';
    }
}

// Make globally available
window.CourseSelector = CourseSelector;