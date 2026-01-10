const courses = [
  { code: "WDD 130", credits: 3, completed: true },
  { code: "WDD 131", credits: 3, completed: true },
  { code: "WDD 231", credits: 3, completed: false },
  { code: "CSE 110", credits: 2, completed: true }
];

const list = document.getElementById("course-list");
const credits = document.getElementById("credits");
const buttons = document.querySelectorAll(".filters button");

function renderCourses(courseArray) {
  list.innerHTML = "";

  courseArray.forEach(course => {
    const div = document.createElement("div");
    div.textContent = course.code;
    div.classList.add("course");

    if (course.completed) {
      div.classList.add("completed");
    }

    list.appendChild(div);
  });

  const total = courseArray.reduce((sum, c) => sum + c.credits, 0);
  credits.textContent =
    `The total credits for courses listed above is ${total}`;
}

renderCourses(courses);

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    let filteredCourses = courses;
    if (filter !== "all") {
      filteredCourses = courses.filter(course =>
        course.code.startsWith(filter.toUpperCase())
      );
    }

    renderCourses(filteredCourses);
  });
});
