const schoolCourses = {
  soet: ['BTech Computer Science', 'BTech Civil', 'BTech Electronics', 'BTech AI & ML', 'BTech Data Science'],
  som: ['BBA', 'BCom', 'MCom', 'MBA'],
  sscs: ['BCA', 'MCA', 'BSc', 'MSc'],
  sol: ['LLM', 'LLB', 'BALLB', 'BBALLB']
};

const courseSemesters = {
  'BCA': 6, 'BSc': 6, 'MCA': 4, 'MSc': 4,
  'BTech Computer Science': 8, 'BTech Civil': 8, 'BTech Electronics': 8, 'BTech AI & ML': 8, 'BTech Data Science': 8,
  'MBA': 4, 'MCom': 4, 'BBA': 6, 'BCom': 6,
  'BALLB': 10, 'BBALLB': 10, 'LLB': 6, 'LLM': 4
};

$(document).ready(function () {
  $('#schoolDropdown').on('change', function () {
    const selectedSchool = $(this).val();
    const courses = schoolCourses[selectedSchool] || [];

    $('#courseDropdown').empty().append('<option selected disabled>- Select Course -</option>');
    $('#semesterDropdown').empty().append('<option selected disabled>- Select Semester -</option>');

    courses.forEach(course => {
      $('#courseDropdown').append(`<option value="${course}">${course}</option>`);
    });
  });

  $('#courseDropdown').on('change', function () {
    const selectedCourse = $(this).val();
    const totalSemesters = courseSemesters[selectedCourse] || 0;

    $('#semesterDropdown').empty().append('<option selected disabled>- Select Semester -</option>');
    for (let i = 1; i <= totalSemesters; i++) {
      let suffix = ['th', 'st', 'nd', 'rd'][((i % 100 - 20) % 10) || (i % 100)] || 'th';
      $('#semesterDropdown').append(`<option value="${i}">${i}${suffix}</option>`);
    }
  });
});

