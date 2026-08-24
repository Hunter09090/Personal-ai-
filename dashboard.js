// dashboard.js

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


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
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



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


const auth =
    getAuth(app);


const db =
    getFirestore(app);


const googleProvider =
    new GoogleAuthProvider();



/* =========================================
   ELEMENTS
========================================= */

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const authMessage =
    document.getElementById("authMessage");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const emailLoginBtn =
    document.getElementById("emailLoginBtn");

const registerBtn =
    document.getElementById("registerBtn");

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");



/* =========================================
   AUTH MESSAGE
========================================= */

function showAuthMessage(message) {

    authMessage.textContent =
        message;

}



/* =========================================
   EMAIL LOGIN
========================================= */

emailLoginBtn.addEventListener(
    "click",
    async () => {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showAuthMessage(
                "Email এবং Password দিন।"
            );

            return;

        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            showAuthMessage("");

        }

        catch (error) {

            console.error(error);

            showAuthMessage(
                getAuthError(error)
            );

        }

    }
);



/* =========================================
   CREATE ACCOUNT
========================================= */

registerBtn.addEventListener(
    "click",
    async () => {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showAuthMessage(
                "Email এবং Password দিন।"
            );

            return;

        }


        if (password.length < 6) {

            showAuthMessage(
                "Password কমপক্ষে ৬ অক্ষরের হতে হবে।"
            );

            return;

        }


        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            showAuthMessage("");

        }

        catch (error) {

            console.error(error);

            showAuthMessage(
                getAuthError(error)
            );

        }

    }
);



/* =========================================
   GOOGLE LOGIN
========================================= */

googleLoginBtn.addEventListener(
    "click",
    async () => {

        try {

            await signInWithPopup(
                auth,
                googleProvider
            );

            showAuthMessage("");

        }

        catch (error) {

            console.error(error);

            showAuthMessage(
                getAuthError(error)
            );

        }

    }
);



/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        }

        catch (error) {

            console.error(error);

        }

    }
);



/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            loginPage.classList.add(
                "hidden"
            );

            dashboardPage.classList.remove(
                "hidden"
            );


            const name =
                user.displayName ||
                user.email.split("@")[0];


            document.getElementById(
                "welcomeText"
            ).textContent =
                `Good Evening, ${name} 👋`;


            startTaskListener(
                user.uid
            );

        }

        else {

            loginPage.classList.remove(
                "hidden"
            );

            dashboardPage.classList.add(
                "hidden"
            );

        }

    }
);



/* =========================================
   AUTH ERROR
========================================= */

function getAuthError(error) {

    switch (error.code) {

        case "auth/invalid-credential":
            return "Email অথবা Password ভুল।";

        case "auth/email-already-in-use":
            return "এই Email দিয়ে ইতিমধ্যে Account আছে।";

        case "auth/invalid-email":
            return "সঠিক Email দিন।";

        case "auth/weak-password":
            return "Password আরও শক্তিশালী দিন।";

        case "auth/popup-closed-by-user":
            return "Google Login বন্ধ করা হয়েছে।";

        case "auth/popup-blocked":
            return "Browser popup block করেছে।";

        case "auth/unauthorized-domain":
            return "এই Website Domain Firebase Authentication-এ অনুমোদিত নয়।";

        default:
            return error.message || "Authentication error হয়েছে।";

    }

}



/* =========================================
   CLOCK
========================================= */

function updateClock() {

    const now =
        new Date();


    let hours =
        now.getHours();

    let minutes =
        now.getMinutes();

    let seconds =
        now.getSeconds();


    hours =
        String(hours).padStart(2, "0");

    minutes =
        String(minutes).padStart(2, "0");

    seconds =
        String(seconds).padStart(2, "0");


    document.getElementById(
        "clock"
    ).textContent =
        `${hours}:${minutes}:${seconds}`;

}


setInterval(
    updateClock,
    1000
);

updateClock();



/* =========================================
   DATE
========================================= */

function updateDate() {

    const now =
        new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    };


    document.getElementById(
        "date"
    ).textContent =
        now.toLocaleDateString(
            "en-US",
            options
        );

}


updateDate();



/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "active"
        );

    }
);



/* =========================================
   TASK ELEMENTS
========================================= */

const taskList =
    document.getElementById("taskList");

const emptyTasks =
    document.getElementById("emptyTasks");

const taskCount =
    document.getElementById("taskCount");

const completedCount =
    document.getElementById("completedCount");

const pendingCount =
    document.getElementById("pendingCount");

const addTaskBtn =
    document.getElementById("addTaskBtn");



/* =========================================
   ADD TASK
========================================= */

addTaskBtn.addEventListener(
    "click",
    async () => {

        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "আগে Login করুন।"
            );

            return;

        }


        const title =
            prompt(
                "Enter your task:"
            );


        if (!title ||
            !title.trim()) {

            return;

        }


        try {

            await addDoc(

                collection(
                    db,
                    "users",
                    user.uid,
                    "tasks"
                ),

                {

                    title:
                        title.trim(),

                    completed:
                        false,

                    createdAt:
                        serverTimestamp()

                }

            );

        }

        catch (error) {

            console.error(
                error
            );

            alert(
                "Task add করতে সমস্যা হয়েছে:\n" +
                error.message
            );

        }

    }
);



/* =========================================
   REAL-TIME TASK LISTENER
========================================= */

let unsubscribeTasks =
    null;


function startTaskListener(
    userId
) {

    if (unsubscribeTasks) {

        unsubscribeTasks();

    }


    const tasksRef =
        collection(
            db,
            "users",
            userId,
            "tasks"
        );


    const tasksQuery =
        query(
            tasksRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    unsubscribeTasks =
        onSnapshot(

            tasksQuery,

            (snapshot) => {

                const tasks = [];


                snapshot.forEach(
                    (item) => {

                        tasks.push({

                            id:
                                item.id,

                            ...item.data()

                        });

                    }
                );


                displayTasks(
                    tasks
                );

            },

            (error) => {

                console.error(
                    "Firestore listener:",
                    error
                );

            }

        );

}



/* =========================================
   DISPLAY TASKS
========================================= */

function displayTasks(
    tasks
) {

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        emptyTasks.style.display =
            "block";

    }

    else {

        emptyTasks.style.display =
            "none";

    }


    let completed =
        0;


    tasks.forEach(
        (task) => {

            if (task.completed) {

                completed++;

            }


            const li =
                document.createElement(
                    "li"
                );


            const left =
                document.createElement(
                    "div"
                );


            left.className =
                "task-left";


            if (task.completed) {

                left.classList.add(
                    "completed"
                );

            }


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";

            checkbox.className =
                "task-checkbox";

            checkbox.checked =
                task.completed;


            checkbox.addEventListener(
                "change",
                () => {

                    updateTask(
                        task.id,
                        checkbox.checked
                    );

                }
            );


            const title =
                document.createElement(
                    "span"
                );


            title.textContent =
                task.title;


            left.appendChild(
                checkbox
            );


            left.appendChild(
                title
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-task";


            deleteButton.textContent =
                "🗑️";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTask(
                        task.id
                    );

                }
            );


            li.appendChild(
                left
            );


            li.appendChild(
                deleteButton
            );


            taskList.appendChild(
                li
            );

        }
    );


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

}



/* =========================================
   UPDATE TASK
========================================= */

async function updateTask(
    taskId,
    completed
) {

    const user =
        auth.currentUser;


    if (!user) return;


    try {

        await updateDoc(

            doc(
                db,
                "users",
                user.uid,
                "tasks",
                taskId
            ),

            {

                completed:
                    completed

            }

        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}



/* =========================================
   DELETE TASK
========================================= */

async function deleteTask(
    taskId
) {

    const user =
        auth.currentUser;


    if (!user) return;


    const confirmDelete =
        confirm(
            "এই Task টি Delete করতে চান?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "users",
                user.uid,
                "tasks",
                taskId
            )

        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}



/* =========================================
   AI CHAT UI
========================================= */

const aiInput =
    document.getElementById(
        "aiInput"
    );

const sendBtn =
    document.getElementById(
        "sendBtn"
    );

const chatBox =
    document.getElementById(
        "chatBox"
    );


function sendMessage() {

    const message =
        aiInput.value.trim();


    if (!message) {

        return;

    }


    const userMessage =
        document.createElement(
            "div"
        );


    userMessage.className =
        "user-message";


    userMessage.textContent =
        message;


    chatBox.appendChild(
        userMessage
    );


    aiInput.value =
        "";


    setTimeout(
        () => {

            const aiMessage =
                document.createElement(
                    "div"
                );


            aiMessage.className =
                "ai-message";


            aiMessage.textContent =
                "আমি আপনার Personal AI Assistant। Real AI API এখনো সংযুক্ত করা হয়নি।";


            chatBox.appendChild(
                aiMessage
            );


            chatBox.scrollTop =
                chatBox.scrollHeight;

        },
        500
    );

}


sendBtn.addEventListener(
    "click",
    sendMessage
);


aiInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Enter"
        ) {

            sendMessage();

        }

    }
);
