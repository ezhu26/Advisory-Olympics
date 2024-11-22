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

//this function generates the schedule by taking a list, advisories
function generateSchedule(advisories) {
    //create a empty list where the schedule will be
    const schedule = [];
    //create a value for the number of adisories
    const numAdvisories = advisories.length;

    //ensure even number of advisories by adding a "Bye" if needed
    if (numAdvisories % 2 !== 0) {
        //add a bye to the end of the list
        advisories.push("Bye");
    }
    //get a total weeks to make sure each advisory plays the other ones just once
    const totalWeeks = advisories.length - 1; 
    //this is for the amount of matchups each week
    const halfSize = advisories.length / 2;

    //generate schedule using round-robin algorithm
    for (let week = 0; week < totalWeeks; week++) {
        //empty list for each weeks matchups
        const weekMatchups = [];
        //for each week, make matchups
        for (let i = 0; i < halfSize; i++) {
            //the home team
            const home = advisories[i];
            //the away team is the one on the backend of the alphabetical list for week 1
            const away = advisories[advisories.length - 1 - i];
            //as long as a Bye isn't in the matchup, add it to the list
            if (home !== "Bye" && away !== "Bye") {
                //add the text content to the list
                weekMatchups.push(`${home} vs ${away}`);
            }
        }
        //add week matchups to the schedule
        schedule.push(weekMatchups);

        //rotate the array for the next week (except the first element)
        advisories.splice(1, 0, advisories.pop());
    }
    //return the schedule list, which has the week matchups
    return schedule;
}

//render schedule in the table
function renderSchedule(schedule) {
    //access the table in HTML called schedule
    const scheduleTable = document.getElementById("schedule");

    //for each week, create a row in the table
    schedule.forEach((weekMatchups, index) => {
        //add a row
        const row = document.createElement("tr");

        //this is the week column
        //add a cell 
        const weekCell = document.createElement("td");
        //week + the text content of the index + 1 so the weeks keep adding up
        weekCell.textContent = `Week ${index + 1}`;
        //add the week cell to the row
        row.appendChild(weekCell);

        //this is the matchups column
        //add a cell
        const matchupCell = document.createElement("td");
        //add the matchups from the list
        matchupCell.innerHTML = weekMatchups.join("<br>");
        //add the cell to the row
        row.appendChild(matchupCell);

        //add the row to the table
        scheduleTable.appendChild(row);
    });
}

//this gets the advisories from firebase and adds them to a list
async function getAdvisories() {
    //create an empty list of the advisories
    const advisories = [];

    //this attempts to get the advisories from firebase
    try {
        //add the docs from firebase to a list
        const list = await getDocs(collection(db, "advisory-olympics"));
        //for each doc in the list
        list.forEach(doc => {
            //add the name of each advisory to the advisories list
            advisories.push(doc.data().name); 
        });
        //generate a schedule with the list of advisory names
        const schedule = generateSchedule(advisories);
        //render the newly created schedule onto the table
        renderSchedule(schedule);
    //if the firebase fetching doesn't work, print an error
    } catch (error) {
        console.error("Error fetching advisories:");
    }
}
//call the fetch function
getAdvisories();
