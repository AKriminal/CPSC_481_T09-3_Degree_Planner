// Function to update semester courses
function updateSemesterCourses(term) {
    // Find the semester card for this term
    const semesterCard = $(`.semester-card:has(h6:contains('${term}'))`);
    if (!semesterCard.length) return;
    
    // Get courses for this term
    const termCourses = CourseDataManager.getTermCourses(term);
    const courseList = semesterCard.find('.course-list');
    
    // Clear existing courses
    courseList.empty();
    
    // Add each course
    Object.values(termCourses).forEach(course => {
        const courseHTML = `
            <div class="course-item" data-code="${course.code}">
                <div class="course-actions">
                    <button class="course-menu-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="course-menu">
                        <div class="course-menu-item move-course">Move Course</div>
                        <div class="course-menu-item delete-course">Delete Course</div>
                    </div>
                </div>
                <div class="fw-bold">${course.code}</div>
                <div>${course.title}</div>
                <div>
                    <select class="status-select ${course.status}">
                        <option value="none">None</option>
                        <option value="completed" ${course.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="in-progress" ${course.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="planned" ${course.status === 'planned' ? 'selected' : ''}>Planned</option>
                    </select>
                    <span class="badge bg-secondary">${course.credits} Credits</span>
                </div>
            </div>
        `;
        
        courseList.append(courseHTML);
    });
    
    // Update semester credits
    let totalCredits = 0;
    Object.values(termCourses).forEach(course => {
        totalCredits += course.credits;
    });
    
    semesterCard.find('div:contains("Total Credits:")').text(`Total Credits: ${totalCredits}`);
}

// Make function globally available
window.updateSemesterCourses = updateSemesterCourses;

// Listen for course data changes
CourseDataManager.onCourseChange(({code, data}) => {
    if (data.term) {
        updateSemesterCourses(data.term);
    }
});

CourseDataManager.onTermChange(({code, data}) => {
    // Update both old and new terms if term changed
    const oldTerm = window.userPlan.courses[code]?.term;
    if (oldTerm) {
        updateSemesterCourses(oldTerm);
    }
    if (data.term) {
        updateSemesterCourses(data.term);
    }
});

CourseDataManager.onStatusChange(({code, data}) => {
    if (data.term) {
        updateSemesterCourses(data.term);
    }
});

// Add this to semester-view.js
CourseDataManager.onCourseReset(({code, data}) => {
    // Find and remove course from semester view
    $(`.course-item[data-code="${code}"]`).remove();
    
    // Update the semester it was in if we have that info
    if (data.term) {
        updateSemesterCourses(data.term);
    }
});

CourseDataManager.onCourseRemove(({code, data}) => {
    // Find and remove course from semester view
    $(`.course-item[data-code="${code}"]`).remove();
});