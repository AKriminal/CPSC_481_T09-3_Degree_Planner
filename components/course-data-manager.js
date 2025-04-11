// Global state for course data
window.userPlan = {
    courses: {},  // Stores all course data
    terms: {},    // Stores courses by term
};

// Course Data Manager class
class CourseDataManager {
    static saveCourse(courseData) {
        const { code, title, term, status = 'planned', credits = 3 } = courseData;
        
        // Save to courses object
        window.userPlan.courses[code] = {
            code,
            title,
            term,
            status,
            credits
        };
        
        // Save to terms object
        if (!window.userPlan.terms[term]) {
            window.userPlan.terms[term] = {};
        }
        window.userPlan.terms[term][code] = {
            code,
            title,
            status,
            credits
        };
        
        // Trigger any registered callbacks
        this.#notifyDataChange('course', { code, data: courseData });
    }
    
    static saveCourseTerm(code, term) {
        const courseData = window.userPlan.courses[code];
        if (courseData) {
            // Remove from old term if exists
            if (courseData.term && window.userPlan.terms[courseData.term]) {
                delete window.userPlan.terms[courseData.term][code];
            }
            
            // Update course data
            courseData.term = term;
            
            // Add to new term
            if (!window.userPlan.terms[term]) {
                window.userPlan.terms[term] = {};
            }
            window.userPlan.terms[term][code] = courseData;
            
            // Trigger callbacks
            this.#notifyDataChange('term', { code, data: courseData });
        }
    }
    
    static saveCourseStatus(code, status) {
        const courseData = window.userPlan.courses[code];
        if (courseData) {
            courseData.status = status;
            
            // Update in terms object if exists
            if (courseData.term && window.userPlan.terms[courseData.term]?.[code]) {
                window.userPlan.terms[courseData.term][code].status = status;
            }
            
            // Trigger callbacks
            this.#notifyDataChange('status', { code, data: courseData });
        }
    }
    
    static removeCourseData(code) {
        const courseData = window.userPlan.courses[code];
        if (courseData) {
            // Remove from terms object
            if (courseData.term && window.userPlan.terms[courseData.term]) {
                delete window.userPlan.terms[courseData.term][code];
            }
            
            // Remove from courses object
            delete window.userPlan.courses[code];
            
            // Trigger callbacks
            this.#notifyDataChange('remove', { code, data: null });
        }
    }
    
    static getCourseData(code) {
        return window.userPlan.courses[code];
    }
    
    static getTermCourses(term) {
        return window.userPlan.terms[term] || {};
    }
    
    static getAllCourses() {
        return window.userPlan.courses;
    }
    
    static getAllTerms() {
        return window.userPlan.terms;
    }
    
    // Private callback handling
    static #callbacks = {
        course: [],
        term: [],
        status: [],
        remove: []
    };
    
    static #notifyDataChange(type, data) {
        this.#callbacks[type].forEach(callback => callback(data));
    }
    
    // Public callback registration
    static onCourseChange(callback) {
        this.#callbacks.course.push(callback);
    }
    
    static onTermChange(callback) {
        this.#callbacks.term.push(callback);
    }
    
    static onStatusChange(callback) {
        this.#callbacks.status.push(callback);
    }
    
    static onCourseRemove(callback) {
        this.#callbacks.remove.push(callback);
    }
}

// Make CourseDataManager globally available
window.CourseDataManager = CourseDataManager;