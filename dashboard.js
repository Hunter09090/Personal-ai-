/* =========================
   LIVE CLOCK
========================= */

function updateClock() {

    const now = new Date();

    let hours = now.getHours();

    let minutes = now.getMinutes();

    let seconds = now.getSeconds();


    hours = String(hours).padStart(2, "0");

    minutes = String(minutes).padStart(2, "0");

    seconds = String(seconds).padStart(2, "0");


    document.getElementById("clock").textContent =
        hours + ":" + minutes + ":" + seconds;
}


setInterval(updateClock, 1000);

updateClock();



/* =========================
   AUTOMATIC DATE
========================= */

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



/* =========================
   MOBILE MENU
========================= */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener("click", function () {

    sidebar.classList.toggle("active");

});



/* =========================
   AI CHAT UI
========================= */

const aiInput =
    document.getElementById("aiInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatBox =
    document.getElementById("chatBox");


function sendMessage() {

    const message =
        aiInput.value.trim();


    if (message === "") {

        return;

    }


    /* USER MESSAGE */

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


    /* TEMPORARY AI RESPONSE */

    setTimeout(function () {

        const aiMessage =
            document.createElement("div");


        aiMessage.className =
            "ai-message";


        aiMessage.textContent =
            "আমি আপনার প্রশ্নটি বুঝতে চেষ্টা করছি। AI system এখনো সংযুক্ত করা হয়নি।";


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
    function(event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);
