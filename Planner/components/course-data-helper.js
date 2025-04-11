/**
 * CourseDataManager - Handles the storage, retrieval, and management of course data
 * throughout the application.
 */
class CourseDataManager {
    constructor() {
        // Initialize storage
        this.courseData = this.loadCourseData();
        
        // Bind methods that will be used as callbacks
        this.saveCourseStatus = this.saveCourseStatus.bind(this);
        this.removeCourseData = this.removeCourseData.bind(this);
    }
    
    /**
     * Load existing course data from localStorage
     * @returns {Object} Course data object
     */
    loadCourseData() {
        try {
            const savedData = localStorage.getItem('courseData');
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) {
            console.error('Error loading course data:', error);
            return {};
        }
    }
    
    /**
     * Save course data to localStorage
     */
    persistData() {
        try {
            localStorage.setItem('courseData', JSON.stringify(this.courseData));
        } catch (error) {
            console.error('Error saving course data:', error);
        }
    }
    
    /**
     * Save course information when added to plan
     * @param {String} courseId - Course code/ID
     * @param {String} title - Course title
     * @param {String} term - Selected term
     * @param {String} status - Course status (planned, in-progress, completed)
     * @param {Boolean} isRequired - Whether course is required
     */
    saveCourse(courseId, title, term, status = 'planned', isRequired = true) {
        // Ensure consistent lowercase formatting for status
        status = status.toLowerCase().replace(' ', '-');
        
        this.courseData[courseId] = {
            title,
            term,
            status,
            isRequired,
            lastUpdated: new Date().toISOString()
        };
        
        this.persistData();
        this.notifyListeners('courseAdded', courseId);
        return this.courseData[courseId];
    }
    
    /**
     * Update course status
     * @param {String} courseId - Course code/ID
     * @param {String} status - New status
     */
    saveCourseStatus(courseId, status) {
        // Ensure consistent lowercase formatting for status
        status = status.toLowerCase().replace(' ', '-');
        
        if (this.courseData[courseId]) {
            this.courseData[courseId].status = status;
            this.courseData[courseId].lastUpdated = new Date().toISOString();
            this.persistData();
            this.notifyListeners('statusChanged', courseId);
        }
    }
    
    /**
     * Update course term
     * @param {String} courseId - Course code/ID
     * @param {String} term - New term
     */
    saveCourseTerm(courseId, term) {
        if (this.courseData[courseId]) {
            this.courseData[courseId].term = term;
            this.courseData[courseId].lastUpdated = new Date().toISOString();
            this.persistData();
            this.notifyListeners('termChanged', courseId);
        }
    }
    
    /**
     * Remove course data when a course is removed
     * @param {String} courseId - Course code/ID
     */
    removeCourseData(courseId) {
        if (this.courseData[courseId]) {
            delete this.courseData[courseId];
            this.persistData();
            this.notifyListeners('courseRemoved', courseId);
        }
    }
    
    /**
     * Get all saved course data
     * @returns {Object} All course data
     */
    getAllCourseData() {
        return {...this.courseData};
    }
    
    /**
     * Get data for a specific course
     * @param {String} courseId - Course code/ID
     * @returns {Object|null} Course data or null if not found
     */
    getCourseData(courseId) {
        return this.courseData[courseId] || null;
    }
    
    /**
     * Get all courses for a specific term
     * @param {String} term - Term to filter by
     * @returns {Array} Array of course objects for the specified term
     */
    getCoursesByTerm(term) {
        return Object.entries(this.courseData)
            .filter(([_, data]) => data.term === term)
            .map(([courseId, data]) => ({
                courseId,
                ...data
            }));
    }
    
    /**
     * Get all courses by status
     * @param {String} status - Status to filter by
     * @returns {Array} Array of course objects with the specified status
     */
    getCoursesByStatus(status) {
        // Ensure consistent lowercase formatting for status
        status = status.toLowerCase().replace(' ', '-');
        
        return Object.entries(this.courseData)
            .filter(([_, data]) => data.status === status)
            .map(([courseId, data]) => ({
                courseId,
                ...data
            }));
    }
    
    // Event listener system for notifying other components of data changes
    eventListeners = {
        courseAdded: [],
        courseRemoved: [],
        statusChanged: [],
        termChanged: []
    };
    
    /**
     * Add an event listener for data changes
     * @param {String} event - Event type (courseAdded, courseRemoved, statusChanged, termChanged)
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }
    
    /**
     * Remove an event listener
     * @param {String} event - Event type
     * @param {Function} callback - Callback function to remove
     */
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event]
                .filter(listener => listener !== callback);
        }
    }
    
    /**
     * Notify all listeners of an event
     * @param {String} event - Event type
     * @param {String} courseId - Course ID that was changed
     */
    notifyListeners(event, courseId) {
        if (this.eventListeners[event]) {
            const courseData = this.getCourseData(courseId);
            this.eventListeners[event].forEach(callback => {
                callback({
                    courseId,
                    data: courseData
                });
            });
        }
    }
}

// Create a global instance
const courseDataManagerInstance = new CourseDataManager();

/**
 * Helper functions for year.html and course.html integration
 */
const CourseDataHelper = {
    /**
     * Load initial course data from storage when creating semester cards
     * @param {String} term - Semester term (e.g., "Fall 2025")
     * @returns {Array} Courses for this term
     */
    loadCoursesForTerm(term) {
        return courseDataManagerInstance.getCoursesByTerm(term);
    },
    
    /**
     * Add a course to a term (for use in year.html)
     * @param {String} courseId - Course code
     * @param {String} title - Course title
     * @param {String} term - Selected term
     * @param {String} status - Course status
     * @param {Number} credits - Course credits
     * @returns {Object} Saved course data
     */
    addCourseToTerm(courseId, title, term, status = 'planned', credits = 3) {
        // Save the course data
        const courseData = courseDataManagerInstance.saveCourse(courseId, title, term, status, true);
        
        // Return the saved data with credits for display
        return {
            ...courseData,
            courseId,
            credits
        };
    },
    
    /**
     * Update a course's term (for use when moving courses)
     * @param {String} courseId - Course code
     * @param {String} newTerm - New term
     */
    updateCourseTerm(courseId, newTerm) {
        courseDataManagerInstance.saveCourseTerm(courseId, newTerm);
    },
    
    /**
     * Update a course's status
     * @param {String} courseId - Course code
     * @param {String} status - New status
     */
    updateCourseStatus(courseId, status) {
        courseDataManagerInstance.saveCourseStatus(courseId, status);
    },
    
    /**
     * Remove a course
     * @param {String} courseId - Course code
     */
    removeCourse(courseId) {
        courseDataManagerInstance.removeCourseData(courseId);
    },
    
    /**
     * Register for status change updates
     * @param {Function} callback - Function to call when status changes
     */
    onStatusChange(callback) {
        courseDataManagerInstance.addEventListener('statusChanged', callback);
    },
    
    /**
     * Register for term change updates
     * @param {Function} callback - Function to call when term changes
     */
    onTermChange(callback) {
        courseDataManagerInstance.addEventListener('termChanged', callback);
    },
    
    /**
     * Check if a course exists in saved data
     * @param {String} courseId - Course code
     * @returns {Boolean} Whether course exists in saved data
     */
    courseExists(courseId) {
        return !!courseDataManagerInstance.getCourseData(courseId);
    },
    
    /**
     * Get the CourseDataManager instance directly
     */
    getManager() {
        return courseDataManagerInstance;
    }
};

// Expose the CourseDataHelper and CourseDataManager to the global scope
window.CourseDataHelper = CourseDataHelper;
window.CourseDataManager = courseDataManagerInstance;