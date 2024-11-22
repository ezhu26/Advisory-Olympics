import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA48UmI50QVSpCJF6voYVudbChpVkFkU6g",
    authDomain: "advisory-olympics.firebaseapp.com",
    projectId: "advisory-olympics",
    storageBucket: "advisory-olympics.appspot.com",
    messagingSenderId: "975067253222",
    appId: "1:975067253222:web:92eff5d86154b91641ee27"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function generateSchedule(advisories) {
    const schedule = [];
    const numAdvisories = advisories.length;

    // Ensure even number of advisories by adding a "Bye" if needed
    if (numAdvisories % 2 !== 0) {
        advisories.push("Bye");
    }

    const totalWeeks = advisories.length - 1; // Each advisory plays all others once
    const halfSize = advisories.length / 2;

    // Generate schedule using round-robin algorithm
    for (let week = 0; week < totalWeeks; week++) {
        const weekMatchups = [];

        for (let i = 0; i < halfSize; i++) {
            const home = advisories[i];
            const away = advisories[advisories.length - 1 - i];
            if (home !== "Bye" && away !== "Bye") {
                weekMatchups.push(`${home} vs ${away}`);
            }
        }

        schedule.push(weekMatchups);

        // Rotate the array for the next week (except the first element)
        advisories.splice(1, 0, advisories.pop());
    }

    return schedule;
}

// Render schedule in the table
function renderSchedule(schedule) {
    const scheduleTable = document.getElementById("schedule");

    schedule.forEach((weekMatchups, index) => {
        const row = document.createElement("tr");

        // Week column
        const weekCell = document.createElement("td");
        weekCell.textContent = `Week ${index + 1}`;
        row.appendChild(weekCell);

        // Matchups column
        const matchupCell = document.createElement("td");
        matchupCell.innerHTML = weekMatchups.join("<br>");
        row.appendChild(matchupCell);

        scheduleTable.appendChild(row);
    });
}

// Fetch advisories from Firebase and generate schedule
async function fetchAdvisoriesAndGenerateSchedule() {
    const advisories = [];

    try {
        const querySnapshot = await getDocs(collection(db, "advisory-olympics"));
        querySnapshot.forEach(doc => {
            advisories.push(doc.data().name); // Assuming each document has a "name" field
        });

        if (advisories.length > 0) {
            const schedule = generateSchedule(advisories);
            renderSchedule(schedule);
        } else {
            alert("No advisories found in the database.");
        }
    } catch (error) {
        console.error("Error fetching advisories:", error);
    }
}

// Execute on page load
fetchAdvisoriesAndGenerateSchedule();