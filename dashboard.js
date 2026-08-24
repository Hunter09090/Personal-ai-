/* =========================================
   FIREBASE
========================================= */

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCymBHHTJobUogVnBCuSyYJlorMwkZN53E",

    authDomain:
        "new-ai-19692.firebaseapp.com",

    projectId:
        "new-ai-19692",

    storageBucket:
        "new-ai-19692.firebasestorage.app",

    messagingSenderId:
        "215456596142",

    appId:
        "1:215456596142:web:582e41fc1e7359bba32d3f",

    measurementId:
        "G-886M5V7BTD"
};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);



/* =========================================
   LIVE CLOCK
========================================= */

function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    document.getElementById("clock").textContent =
        `${hours}:${minutes}:${seconds}`;
}


setInterval(updateClock, 1000);

updateClock();



/* =========================================
   DATE
========================================= */

function updateDate() {

    const now = new Date();

    const options = {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    };

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-US", options);
}


updateDate();



/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener("click", () => {

    sidebar.classList.toggle("active");

});



/* =========================================
   TASK ELEMENTS
========================================= */

const taskList =
    document.getElementById("taskList");

const taskCount =
    document.getElementById("taskCount");

const completedCount =
    document.getElementById("completedCount");

const pendingCount =
    document.getElementById("pendingCount");



/* =========================================
   ADD TASK
========================================= */

async function addTask() {

    const taskText =
        prompt("Enter your task:");

    if (!taskText) {

        return;

    }


    try {

        await addDoc(
            collection(db, "tasks"),
            {

                title: taskText,

                completed: false,

                createdAt:
                    serverTimestamp()

            }
        );

        console.log("Task added successfully");

    }

    catch (error) {

        console.error(
            "Error adding task:",
            error
        );

        alert(
            "Task add করতে সমস্যা হয়েছে।"
        );

    }

}



/* =========================================
   CONNECT ADD BUTTON
========================================= */

const addButton =
    document.querySelector(".small-btn");


addButton.addEventListener(
    "click",
    addTask
);



/* =========================================
   DISPLAY TASK
========================================= */

function displayTasks(tasks) {

    taskList.innerHTML = "";


    let completed = 0;


    tasks.forEach(task => {

        if (task.completed) {

            completed++;

        }


        const li =
            document.createElement("li");


        li.innerHTML = `

            <span>

                <input
                    type="checkbox"
                    class="task-checkbox"
                    data-id="${task.id}"
                    ${task.completed ? "checked" : ""}
                >

                <span
                    style="
                        margin-left:8px;
                        ${
                            task.completed
                            ? "text-decoration:line-through;"
                            : ""
                        }
                    "
                >
                    ${task.title}
                </span>

            </span>


            <button
                class="delete-task"
                data-id="${task.id}"
                style="
                    border:none;
                    background:none;
                    cursor:pointer;
                    font-size:16px;
                "
            >
                🗑️
            </button>

        `;


        taskList.appendChild(li);

    });


    const total =
        tasks.length;

    const pending =
        total - completed;


    taskCount.textContent =
        total;

    completedCount.textContent =
        completed;

    pendingCount.textContent =
        pending;


    /* CHECKBOX EVENTS */

    document
        .querySelectorAll(".task-checkbox")
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    updateTask(
                        checkbox.dataset.id,
                        checkbox.checked
                    );

                }
            );

        });


    /* DELETE EVENTS */

    document
        .querySelectorAll(".delete-task")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteTask(
                        button.dataset.id
                    );

                }
            );

        });

}



/* =========================================
   UPDATE TASK
========================================= */

async function updateTask(
    taskId,
    completed
) {

    try {

        await updateDoc(

            doc(
                db,
                "tasks",
                taskId
            ),

            {

                completed: completed

            }

        );

    }

    catch (error) {

        console.error(
            "Update error:",
            error
        );

    }

}



/* =========================================
   DELETE TASK
========================================= */

async function deleteTask(taskId) {

    const confirmDelete =
        confirm(
            "এই task টি delete করতে চান?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "tasks",
                taskId
            )

        );

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );

    }

}



/* =========================================
   REAL-TIME FIRESTORE LISTENER
========================================= */

const tasksQuery =
    query(

        collection(
            db,
            "tasks"
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );


onSnapshot(

    tasksQuery,

    snapshot => {

        const tasks = [];


        snapshot.forEach(
            document => {

                tasks.push({

                    id: document.id,

                    ...document.data()

                });

            }
        );


        displayTasks(tasks);

    },


    error => {

        console.error(
            "Firestore listener error:",
            error
        );

    }

);



/* =========================================
   AI CHAT UI
========================================= */

const aiInput =
    document.getElementById("aiInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatBox =
    document.getElementById("chatBox");


function sendMessage() {

    const message =
        aiInput.value.trim();


    if (!message) {

        return;

    }


    const userMessage =
        document.createElement("div");


    userMessage.className =
        "user-message";


    userMessage.textContent =
        message;


    chatBox.appendChild(
        userMessage
    );


    aiInput.value = "";


    setTimeout(() => {

        const aiMessage =
            document.createElement("div");


        aiMessage.className =
            "ai-message";


        aiMessage.textContent =
            "আমি আপনার প্রশ্নটি বুঝতে চেষ্টা করছি। Real AI এখনো connect করা হয়নি।";


        chatBox.appendChild(
            aiMessage
        );


        chatBox.scrollTop =
            chatBox.scrollHeight;

    }, 600);

}


sendBtn.addEventListener(
    "click",
    sendMessage
);


aiInput.addEventListener(
    "keypress",
    event => {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);
