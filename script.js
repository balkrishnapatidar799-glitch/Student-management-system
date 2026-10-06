// =====================================================
// STUDENT MANAGEMENT SYSTEM
// =====================================================


// ================= STORAGE =================

const STUDENT_KEY = "studentManagementData";

const HISTORY_KEY = "studentUpdateHistory";


// Get students from LocalStorage

let students =
    JSON.parse(
        localStorage.getItem(STUDENT_KEY)
    ) || [];


// Get history from LocalStorage

let history =
    JSON.parse(
        localStorage.getItem(HISTORY_KEY)
    ) || [];


// ================= ELEMENTS =================

const studentForm =
    document.getElementById("studentForm");

const nameInput =
    document.getElementById("name");

const mobileInput =
    document.getElementById("mobile");

const emailInput =
    document.getElementById("email");

const ageInput =
    document.getElementById("age");

const courseInput =
    document.getElementById("course");

const cityInput =
    document.getElementById("city");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");

const tableBody =
    document.getElementById("studentTableBody");

const searchInput =
    document.getElementById("searchInput");

const courseFilter =
    document.getElementById("courseFilter");

const sortSelect =
    document.getElementById("sortSelect");

const resultCount =
    document.getElementById("resultCount");

const emptyMessage =
    document.getElementById("emptyMessage");

const historyContainer =
    document.getElementById("historyContainer");

const deleteModal =
    document.getElementById("deleteModal");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const clearAllBtn =
    document.getElementById("clearAllBtn");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");

const toast =
    document.getElementById("toast");


// ================= EDIT / DELETE STATE =================

let editId = null;

let deleteId = null;


// ================= SAVE DATA =================

function saveStudents() {

    localStorage.setItem(
        STUDENT_KEY,
        JSON.stringify(students)
    );
}


function saveHistory() {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


// ================= FORM SUBMIT =================

studentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // Get gender

        const gender =
            document.querySelector(
                'input[name="gender"]:checked'
            );


        if (!gender) {

            showToast(
                "Please select gender",
                "error"
            );

            return;
        }


        const name =
            nameInput.value.trim();

        const mobile =
            mobileInput.value.trim();

        const email =
            emailInput.value.trim();

        const age =
            Number(ageInput.value);

        const course =
            courseInput.value;

        const city =
            cityInput.value.trim();


        // ================= VALIDATION =================

        if (name.length < 3) {

            showToast(
                "Name must contain at least 3 characters",
                "error"
            );

            return;
        }


        if (!/^[0-9]{10}$/.test(mobile)) {

            showToast(
                "Mobile number must contain exactly 10 digits",
                "error"
            );

            return;
        }


        if (age < 10 || age > 100) {

            showToast(
                "Please enter a valid age",
                "error"
            );

            return;
        }


        // ================= DUPLICATE MOBILE =================

        const duplicate =
            students.find(
                student =>
                    student.mobile === mobile &&
                    student.id !== editId
            );


        if (duplicate) {

            showToast(
                "This mobile number already exists!",
                "error"
            );

            mobileInput.focus();

            return;
        }


        // ================= STUDENT OBJECT =================

        const studentData = {

            name: name,

            mobile: mobile,

            email: email,

            age: age,

            gender: gender.value,

            course: course,

            city: city

        };


        // ================= EDIT =================

        if (editId !== null) {

            const index =
                students.findIndex(
                    student =>
                        student.id === editId
                );


            if (index !== -1) {

                students[index] = {

                    ...students[index],

                    ...studentData,

                    updatedAt:
                        new Date().toISOString()

                };


                addHistory(
                    "Updated",
                    name
                );


                showToast(
                    "Student updated successfully!"
                );
            }


            editId = null;

            submitBtn.textContent =
                "Add Student";

            formTitle.textContent =
                "Add Student";

            cancelBtn.hidden = true;

        }

        // ================= ADD =================

        else {

            const newStudent = {

                id:
                    Date.now(),

                ...studentData,

                createdAt:
                    new Date().toISOString()

            };


            students.push(newStudent);


            addHistory(
                "Added",
                name
            );


            showToast(
                "Student added successfully!"
            );
        }


        saveStudents();

        renderStudents();

        updateDashboard();

        studentForm.reset();

    }
);


// ================= RENDER STUDENTS =================

function renderStudents() {

    let filteredStudents =
        [...students];


    // ================= SEARCH =================

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    if (search) {

        filteredStudents =
            filteredStudents.filter(
                student =>

                    student.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    student.mobile
                        .includes(search)

                    ||

                    student.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    student.city
                        .toLowerCase()
                        .includes(search)

            );
    }


    // ================= COURSE FILTER =================

    const selectedCourse =
        courseFilter.value;


    if (selectedCourse !== "All") {

        filteredStudents =
            filteredStudents.filter(
                student =>
                    student.course ===
                    selectedCourse
            );
    }


    // ================= SORT =================

    const sort =
        sortSelect.value;


    if (sort === "newest") {

        filteredStudents.sort(
            (a, b) =>
                b.id - a.id
        );
    }


    else if (sort === "oldest") {

        filteredStudents.sort(
            (a, b) =>
                a.id - b.id
        );
    }


    else if (sort === "nameAZ") {

        filteredStudents.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );
    }


    else if (sort === "nameZA") {

        filteredStudents.sort(
            (a, b) =>
                b.name.localeCompare(
                    a.name
                )
        );
    }


    else if (sort === "ageLow") {

        filteredStudents.sort(
            (a, b) =>
                a.age - b.age
        );
    }


    else if (sort === "ageHigh") {

        filteredStudents.sort(
            (a, b) =>
                b.age - a.age
        );
    }


    // ================= TABLE =================

    tableBody.innerHTML = "";


    if (filteredStudents.length === 0) {

        emptyMessage.style.display =
            "block";

    }

    else {

        emptyMessage.style.display =
            "none";
    }


    filteredStudents.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(student.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(student.mobile)}
                </td>

                <td>
                    ${escapeHTML(student.email)}
                </td>

                <td>
                    ${student.age}
                </td>

                <td>
                    ${escapeHTML(student.gender)}
                </td>

                <td>
                    ${escapeHTML(student.course)}
                </td>

                <td>
                    ${escapeHTML(student.city)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            onclick="editStudent(${student.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="openDeleteModal(${student.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    resultCount.textContent =
        `${filteredStudents.length} student(s) found`;

}


// ================= EDIT STUDENT =================

function editStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (!student) return;


    editId = id;


    nameInput.value =
        student.name;

    mobileInput.value =
        student.mobile;

    emailInput.value =
        student.email;

    ageInput.value =
        student.age;

    courseInput.value =
        student.course;

    cityInput.value =
        student.city;


    const gender =
        document.querySelector(
            `input[name="gender"][value="${student.gender}"]`
        );


    if (gender) {

        gender.checked = true;
    }


    submitBtn.textContent =
        "Update Student";

    formTitle.textContent =
        "Edit Student";

    cancelBtn.hidden = false;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ================= CANCEL EDIT =================

cancelBtn.addEventListener(
    "click",
    function () {

        editId = null;

        studentForm.reset();

        formTitle.textContent =
            "Add Student";

        submitBtn.textContent =
            "Add Student";

        cancelBtn.hidden = true;

    }
);


// ================= DELETE MODAL =================

function openDeleteModal(id) {

    deleteId = id;

    deleteModal.style.display =
        "flex";
}


cancelDeleteBtn.addEventListener(
    "click",
    function () {

        deleteId = null;

        deleteModal.style.display =
            "none";
    }
);


// ================= CONFIRM DELETE =================

confirmDeleteBtn.addEventListener(
    "click",
    function () {

        if (deleteId === null) return;


        const student =
            students.find(
                student =>
                    student.id === deleteId
            );


        if (student) {

            addHistory(
                "Deleted",
                student.name
            );

        }


        students =
            students.filter(
                student =>
                    student.id !== deleteId
            );


        saveStudents();

        renderStudents();

        updateDashboard();


        deleteId = null;

        deleteModal.style.display =
            "none";


        showToast(
            "Student deleted successfully!"
        );

    }
);


// ================= SEARCH =================

searchInput.addEventListener(
    "input",
    renderStudents
);


// ================= FILTER =================

courseFilter.addEventListener(
    "change",
    renderStudents
);


// ================= SORT =================

sortSelect.addEventListener(
    "change",
    renderStudents
);


// ================= DASHBOARD =================

function updateDashboard() {

    document.getElementById(
        "totalStudents"
    ).textContent =
        students.length;


    const male =
        students.filter(
            student =>
                student.gender === "Male"
        ).length;


    const female =
        students.filter(
            student =>
                student.gender === "Female"
        ).length;


    document.getElementById(
        "maleStudents"
    ).textContent =
        male;


    document.getElementById(
        "femaleStudents"
    ).textContent =
        female;


    if (students.length === 0) {

        document.getElementById(
            "averageAge"
        ).textContent = "0";

        return;
    }


    const totalAge =
        students.reduce(
            (total, student) =>
                total + Number(student.age),
            0
        );


    const average =
        totalAge / students.length;


    document.getElementById(
        "averageAge"
    ).textContent =
        average.toFixed(1);

}


// ================= HISTORY =================

function addHistory(
    action,
    studentName
) {

    const historyItem = {

        id: Date.now(),

        action: action,

        studentName: studentName,

        time:
            new Date().toISOString()

    };


    history.unshift(
        historyItem
    );


    // Keep only latest 30 records

    history =
        history.slice(0, 30);


    saveHistory();

    renderHistory();

}


// ================= RENDER HISTORY =================

function renderHistory() {

    historyContainer.innerHTML = "";


    if (history.length === 0) {

        historyContainer.innerHTML = `

            <p class="no-history">
                No update history available.
            </p>

        `;

        return;
    }


    history.forEach(
        item => {

            const div =
                document.createElement("div");


            div.className =
                "history-item";


            const date =
                new Date(item.time);


            div.innerHTML = `

                <strong>
                    ${escapeHTML(item.action)}
                </strong>

                -
                ${escapeHTML(item.studentName)}

                <small>
                    ${date.toLocaleString()}
                </small>

            `;


            historyContainer.appendChild(
                div
            );

        }
    );

}


// ================= CLEAR ALL =================

clearAllBtn.addEventListener(
    "click",
    function () {

        if (students.length === 0) {

            showToast(
                "No student data available",
                "error"
            );

            return;
        }


        const confirmResult =
            confirm(
                "Are you sure you want to delete ALL student records?"
            );


        if (!confirmResult) return;


        students = [];

        saveStudents();

        renderStudents();

        updateDashboard();

        addHistory(
            "Cleared",
            "All student records"
        );


        showToast(
            "All student records deleted!"
        );

    }
);


// ================= CLEAR HISTORY =================

clearHistoryBtn.addEventListener(
    "click",
    function () {

        if (history.length === 0) {

            showToast(
                "History is already empty",
                "error"
            );

            return;
        }


        const confirmResult =
            confirm(
                "Clear complete update history?"
            );


        if (!confirmResult) return;


        history = [];

        saveHistory();

        renderHistory();


        showToast(
            "History cleared!"
        );

    }
);


// ================= TOAST =================

function showToast(
    message,
    type = "success"
) {

    toast.textContent =
        message;


    if (type === "error") {

        toast.style.background =
            "#dc2626";

    }

    else {

        toast.style.background =
            "#16a34a";
    }


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ================= HTML SECURITY =================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ================= INITIAL LOAD =================

renderStudents();

updateDashboard();

renderHistory();