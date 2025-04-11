// Course Alerts Manager
class CourseAlertsManager {
    // Store prerequisite requirements
    static prerequisites = {
        'CPSC233': ['CPSC231'],
        'CPSC355': ['CPSC233'],
        'CPSC351': ['CPSC233','MATH265'],
        'CPSC331': ['CPSC233','CPSC251'],
        // Add more prerequisite relationships as needed
    };
    
    // Check if a course has any prerequisite alerts
    static checkPrerequisites(courseCode, courseList) {
        // If this course has prerequisites defined
        if (this.prerequisites[courseCode]) {
            const prereqs = this.prerequisites[courseCode];
            const missingPrereqs = [];
            
            // Check each prerequisite
            for (const prereq of prereqs) {
                const prereqCourse = courseList[prereq];
                // Only consider prerequisite met if course exists and is either completed or planned
                if (!prereqCourse || (prereqCourse.status !== 'completed' && prereqCourse.status !== 'planned')) {
                    missingPrereqs.push(prereq);
                }
            }
            
            if (missingPrereqs.length > 0) {
                return {
                    hasAlert: true,
                    missingPrereqs: missingPrereqs,
                    courseCode: courseCode
                };
            }
        }
        
        return { hasAlert: false };
    }
    
    // Check for duplicate courses across terms
    static checkDuplicates(courseCode, allTerms) {
        const termsList = [];
        
        // Look through all terms to find where this course exists
        Object.keys(allTerms).forEach(term => {
            if (allTerms[term][courseCode]) {
                termsList.push(term);
            }
        });
        
        // If found in multiple terms
        if (termsList.length > 1) {
            return {
                hasAlert: true,
                terms: termsList,
                courseCode: courseCode
            };
        }
        
        return { hasAlert: false };
    }
    
    // Update all alerts for a specific semester
    static updateSemesterAlerts(semesterCard) {
        const courseItems = semesterCard.find('.course-item');
        const prereqAlerts = [];
        const duplicateAlerts = [];
        
        // Remove existing alerts
        semesterCard.find('.semester-alerts').remove();
        
        // Check for alerts on all courses in this semester
        courseItems.each(function() {
            const courseCode = $(this).data('code');
            const allCourses = CourseDataManager.getAllCourses();
            const allTerms = CourseDataManager.getAllTerms();
            
            // Check for prerequisite alerts
            const prereqAlert = CourseAlertsManager.checkPrerequisites(courseCode, allCourses);
            if (prereqAlert.hasAlert) {
                prereqAlerts.push({
                    courseCode: courseCode,
                    missingPrereqs: prereqAlert.missingPrereqs
                });
            }
            
            // Check for duplicate alerts
            const duplicateAlert = CourseAlertsManager.checkDuplicates(courseCode, allTerms);
            if (duplicateAlert.hasAlert) {
                const currentTerm = semesterCard.find('h6').text().trim();
                const otherTerms = duplicateAlert.terms.filter(t => t !== currentTerm);
                
                duplicateAlerts.push({
                    courseCode: courseCode,
                    otherTerms: otherTerms
                });
            }
        });
        
        // Only create alert section if there are alerts to show
        if (prereqAlerts.length > 0 || duplicateAlerts.length > 0) {
            let alertsHTML = '<div class="semester-alerts">';
            
            // Add prerequisite alerts
            if (prereqAlerts.length > 0) {
                prereqAlerts.forEach(alert => {
                    const courseName = CourseDataManager.getCourseData(alert.courseCode)?.title || alert.courseCode;
                    alertsHTML += `
                        <div class="badge bg-danger prereq-alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            Missing prerequisites for ${alert.courseCode}: ${alert.missingPrereqs.join(', ')}
                        </div>
                    `;
                });
            }
            
            // Add duplicate alerts
            if (duplicateAlerts.length > 0) {
                duplicateAlerts.forEach(alert => {
                    alertsHTML += `
                        <div class="badge" style="background-color: #c71585; color: white;">
                            <i class="fas fa-clone"></i>
                            ${alert.courseCode} also in: ${alert.otherTerms.join(', ')}
                        </div>
                    `;
                });
            }
            
            alertsHTML += '</div>';
            
            // Insert alerts right after the semester title
            semesterCard.find('h6').after(alertsHTML);
        }
    }
    
    // Process all semesters and update alerts
    static updateAllAlerts() {
        $('.semester-card').each(function() {
            CourseAlertsManager.updateSemesterAlerts($(this));
        });
    }
    
    // Initialize the alerts system
    static init() {
        // Add CSS for new alert style
        const alertStyles = `
            <style>
                .semester-alerts {
                    margin-bottom: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .semester-alerts .badge {
                    text-align: left;
                    padding: 8px 10px;
                    font-size: 12px;
                    display: flex;
                    align-items: flex-start;
                    border-radius: 4px;
                    font-weight: normal;
                    white-space: normal;
                }
                
                .semester-alerts i {
                    margin-right: 5px;
                    margin-top: 2px;
                }
            </style>
        `;
        $('head').append(alertStyles);
        
        // Register for course data change events
        CourseDataManager.onCourseChange(({code, data}) => {
            if (data.term) {
                this.updateAllAlerts();
            }
        });
        
        CourseDataManager.onTermChange(({code, data}) => {
            this.updateAllAlerts();
        });
        
        CourseDataManager.onStatusChange(({code, data}) => {
            this.updateAllAlerts();
        });
        
        CourseDataManager.onCourseRemove(({code, data}) => {
            this.updateAllAlerts();
        });
        
        // Initial alert check
        this.updateAllAlerts();
    }
}

// Initialize when document is ready
$(document).ready(function() {
    CourseAlertsManager.init();
});