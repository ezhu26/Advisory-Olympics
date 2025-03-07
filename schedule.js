import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

const ADVISORY_ID = "PB";
let scheduleWithDates = [];
let manualDates = [];
let totalWeeks = 34;

function setTotalWeeks() {
    const totalWeeks = document.getElementById("totalWeeks").value;
    if (totalWeeks > 0) {
        generateWeekDateInputs(totalWeeks);
    } else {
        alert("Please enter a valid number of weeks.");
    }
}
//this function generates the schedule by taking a list, advisories
async function generateSchedule(advisories) {
    //create a value for the number of adisories
    console.log("checkpoint 4");
    const numAdvisories = advisories.length;
    //create array with dates 
    console.log("checkpoint 5");
    //create the start date for the year 
    //set the date
    //ensure even number of advisories by adding a "Bye" if needed
    if (numAdvisories % 2 !== 0) {
        //add a bye to the end of the list
        advisories.push({ id: null, name: "Bye" });
    }
    //get a total weeks to make sure each advisory plays the other ones just once
    //this is for the amount of matchups each week
    const halfSize = advisories.length / 2;

    const advisoryRef = doc(db, "advisory-olympics", ADVISORY_ID);
    const docSnap = await getDoc(advisoryRef);
    let dates1 = [];

    if (docSnap.exists() && Array.isArray(docSnap.data().dates)) {
        dates1 = docSnap.data().dates;
    } else {
        console.log("No saved dates found or dates are not in an array format.");
    }
    console.log(dates1);
    //generate schedule using round-robin algorithm
    for (let week = 0; week < totalWeeks; week++) {
        //empty list for each weeks matchups
        shuffleArray(advisories);
        const weekMatchups = [];
        //for each week, make matchups
        //get the date as the locale date 
        let formattedDate = "No date"; // Default value if no date is found
        if (dates1[week]) {
            formattedDate = dates1[week].date; // Assign saved date if available
        }
        console.log("checkpoint 5.5");
        for (let i = 0; i < halfSize; i++) {

            let homeBoolean = Math.random() > 0.5;  // Randomize home vs away
            let awayBoolean = !homeBoolean;
            //the home team
            const home = advisories[i];
            //the away team is the one on the backend of the alphabetical list for week 1
            const away = advisories[advisories.length - 1 - i];
            //as long as a Bye isn't in the matchup, add it to the list
            if (home === "Bye") {
                weekMatchups.push(`${away.name} is on a Bye`);
                updateSchedule(away.id, week, "Bye", formattedDate, homeBoolean, awayBoolean)
            } else if (away === "Bye") {
                weekMatchups.push(`${home.name} is on a Bye`);
                updateSchedule(home.id, week, "Bye", formattedDate, homeBoolean, awayBoolean)
            } else {
                weekMatchups.push(`${home.name} vs ${away.name}`);
                updateSchedule(home.id, week, away.name, formattedDate, homeBoolean, awayBoolean)
                updateSchedule(away.id, week, home.name, formattedDate, awayBoolean, homeBoolean)
            } 
        }
        //add week matchups to the schedule
        shuffleArray(weekMatchups)
        scheduleWithDates.push({matchups: weekMatchups, date: formattedDate});
        console.log("checkpoint 6");
        
        //rotate the array for the next week (except the first element)
        const last = advisories.pop();
        advisories.splice(1, 0, last);
        //add a week to the date
    }
    //return the schedule list, which has the week matchups
    return scheduleWithDates;
}

//this function creates options to put in dates
function generateWeekDateInputs() {
    const totalWeeks = document.getElementById("totalWeeks").value;
    const container = document.getElementById("weekDatesContainer");
    container.innerHTML = ""; // Clear previous inputs

    for (let i = 1; i <= totalWeeks; i++) {
        const div = document.createElement("div");
        div.innerHTML = `
            <label for="week${i}">Week ${i} Date:</label>
            <input type="date" id="week${i}" name="week${i}">
        `;
        container.appendChild(div);
    }
}

//this function saves manual dates
async function saveManualDates() {
    const weekInputs = document.querySelectorAll("#weekDatesContainer input");
    let dates = [];

    weekInputs.forEach((input, index) => {
        dates.push({
            week: index + 1,
            date: input.value
        });
    });

    const advisoryRef = doc(db, "advisory-olympics", ADVISORY_ID);

    try {
        await updateDoc(advisoryRef, { dates });
        console.log("Saved Dates")
        alert("Schedule saved successfully for advisory 'zattise'!");
    } catch (error) {
        console.error("Error saving schedule");
        alert("Error saving schedule.");
    }
}

async function loadSavedDates() {
    const advisoryRef = doc(db, "advisory-olympics", ADVISORY_ID);
    const docSnap = await getDoc(advisoryRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dates) {
            dates = data.dates; // Assign saved dates to the global `dates` array
            displayWeekDateInputs(dates);
        }
    } else {
        console.log("No such advisory found!");
    }
}


function displayWeekDateInputs(dates) {
    const container = document.getElementById("weekDatesContainer");
    container.innerHTML = "";

   dates.forEach(({ week, date }) => {
        let input = document.createElement("input");
        input.type = "date";
        input.value = date;
        container.appendChild(input);
    });
}

// Load schedule for a specific advisory on page load
document.addEventListener("DOMContentLoaded", () => loadSavedDates());



//this is a function I found on the internet for making it more random
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

//if schedule already exists, this is used to pull from firebase
async function getFirebaseSchedule(advisories) {
    let firebaseSchedule = [];

    try {
        let weekMatchupsMap = {};

        const schedulePromises = advisories.map(async (advisory) => {
            const scheduleRef = collection(db, "advisory-olympics", advisory.id, "schedule");
            const scheduleSnapshot = await getDocs(scheduleRef);

            scheduleSnapshot.forEach((doc) => {
                if (doc.id.startsWith("week_")) { 
                    const data = doc.data();
                    const weekNumber = parseInt(doc.id.split("_")[1]);  

                    if (!weekMatchupsMap[weekNumber]) {
                        weekMatchupsMap[weekNumber] = { date: data.date || "No date", matchups: new Set() };
                    }

                    if (data.opponent) {
                        
                        const matchupKey = [advisory.name, data.opponent].sort().join(" vs ");

                        weekMatchupsMap[weekNumber].matchups.add(matchupKey);
                    }
                }
            });
        });

        await Promise.all(schedulePromises);

   
        firebaseSchedule = Object.keys(weekMatchupsMap)
            .sort((a, b) => a - b) 
            .map(week => ({
                date: weekMatchupsMap[week].date,
                matchups: Array.from(weekMatchupsMap[week].matchups) 
            }));

    } catch (error) {
        console.error("Error fetching schedule from Firestore");
    }

    return firebaseSchedule;
}
// getSchedule and updates in firebase
//not used if it is fetching from firebase already
async function updateSchedule(teamId, week, otherteam, date1, home, away) {
    //if team doesn't exist
    if (!teamId) return;
    //attempt to update doc
    try {
        //doc1 is the advisory that is attempting to be updated
        const advisoryDocRef = doc(db, "advisory-olympics", teamId);
        const weekDocRef = doc(advisoryDocRef, "schedule", `week_${week + 1}`);

        //update the doc by adding the week and opponent
        //week+1 is because it starts at week 0
        await setDoc(weekDocRef, {
            //create a map type thing with the week as the head
                week: week + 1,
                opponent: otherteam,
                date: date1, 
                home: home,
                away: away,
                outcome: ""
            }, {merge: true})
        ;
        //print the update
        console.log(`Updated ${teamId} for week ${week + 1}: Opponent is ${otherteam} on ${date1}`);
        //if error, print
    } catch (error) {
        console.error(`Error updating document for ${teamId}:`, error);
    }
}

//if a new schedule needs to be generated, this is called in getAdvisories
async function generateNewSchedule() {
    document.getElementById("schedule").innerHTML = "";
    document.getElementById("weekDropdown").innerHTML = "<option value=''>Select Week</option>";
    document.getElementById("matchups").innerHTML = "";

    try {
        const list = await getDocs(collection(db, "advisory-olympics"));

        if (list.empty) {
            console.error("No advisories found in Firestore.");
            return;
        }
        console.log("checkpoint 5.1");
        const advisories = list.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (!advisories || advisories.length === 0) {
            console.error("Advisory list is empty.");
            return;
        }
        console.log("checkpoint 5.15");
        scheduleWithDates = generateSchedule(advisories);
        console.log("checkpoint 5.2");
        if (!scheduleWithDates || scheduleWithDates.length === 0) {
            console.error("Failed to generate schedule.");
            return;
        }
        console.log("checkpoint 5.3");
        renderSchedule(scheduleWithDates);
        console.log("checkpoint 5.4");
    } catch (error) {
        console.error("Error generating new schedule");
    }
}

//add event listener to the generate button
document.getElementById("generateButton").addEventListener("click", generateNewSchedule);
//render schedule in the table
function renderSchedule(scheduleWithDates) {
    const scheduleTable = document.getElementById("schedule");
    const weekDropdown = document.getElementById("weekDropdown");

    scheduleTable.innerHTML = "";
    weekDropdown.innerHTML = "<option value=''>Select Week</option>";

    scheduleWithDates.forEach((weekData, index) => {
        const row = document.createElement("tr");

        const weekCell = document.createElement("td");
        weekCell.textContent = `Week ${index + 1}`; // - ${weekData.date}`; // Display the date here
        row.appendChild(weekCell);

        const matchupCell = document.createElement("td");
        matchupCell.innerHTML = weekData.matchups.join("<br>");
        row.appendChild(matchupCell);

        scheduleTable.appendChild(row);

        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Week ${index + 1} - ${weekData.date}`;
        weekDropdown.appendChild(option);
    });
}

//this function displays the current week matchups through the dropdown menu
function displayWeekMatchups() {
    //access the dropdown from the html
    const weekDropdown = document.getElementById("weekDropdown");
    //depending on what week is selected in the dropdown, make that the selected week
    const selectedWeek = weekDropdown.value; 
    //this is for displaying the matchups once it is selected
    const matchupDisplay = document.getElementById("matchups");
    console.log("checkpoint 10");
    //if the week that is selected exists
    if (selectedWeek !== "") {
        //access the global variable schedule with the selected week
        const matchups = scheduleWithDates[selectedWeek].matchups;
        //clear the previous display
        matchupDisplay.innerHTML = ""; 
        //create a container for the matchups
        const matchupContainer = document.createElement("div");
        //create a class called matchup container
        matchupContainer.className = "matchup-container";
        console.log("checkpoint 11");
        //add each matchup as a card
        matchups.forEach(matchup => {
            if (matchup.toLowerCase().indexOf("bye") === -1){
            //create a new card for each matchup
            const card = document.createElement("div");
            //add each card to a class called matchup-card
            card.className = "matchup-card";
            //create "teams" that are split with a versus sign
            const teams = matchup.split(" vs ");
            //in each card, add the home team, a "vs.", and the away team
            card.innerHTML = `
                <div class="team home-team">${teams[0]}</div>
                <div class="versus">vs</div>
                <div class="team away-team">${teams[1]}</div>
            `;
            //add the card to the overall matchup container
            matchupContainer.appendChild(card);
            } else {
                const card = document.createElement("div");
                //add each card to a class called matchup-card
                card.className = "matchup-card";
                //split the bye by the words is on a 
                const teams = matchup.split(" is on a ");
                card.innerHTML = `
                    <div class="team home-team">${teams[0]}</div>
                    <div class="is-on-a">is on a<div/>
                    <div class="team bye">Bye</div>
                    `;
                    matchupContainer.appendChild(card);
            }
        });
        //add the container to the display
        matchupDisplay.appendChild(matchupContainer);
    } else {
        matchupDisplay.innerHTML = "No week selected";
    }
}
window.displayWeekMatchups = displayWeekMatchups;

//this gets the advisories from firebase and adds them to a list
async function getAdvisories() {
    const advisories = [];

    try {
        const list = await getDocs(collection(db, "advisory-olympics"));
        for (const doc of list.docs) {
            const advisory = { id: doc.id, ...doc.data() };
            advisories.push(advisory);
            console.log("checkpoint 1");
        }
            // Check if the advisory has a schedule
            //const scheduleRef = collection(db, "advisory-olympics", advisory.id, "schedule");
            //const scheduleSnapshot = await getDocs(scheduleRef);
            
            console.log("checkpoint 2");
            //if (!scheduleSnapshot.empty) {
            scheduleWithDates = await getFirebaseSchedule(advisories);
            //} else {
                //console.log("checkpoint 3");
                //scheduleWithDates = generateSchedule(advisories);
            //}

        console.log("checkpoint 8");
        //render the newly created schedule onto the table
        renderSchedule(scheduleWithDates);

        console.log("checkpoint 9");

        //selectCurrentWeek(scheduleWithDates);
        //console.log(manualDates);
    //if the firebase fetching doesn't work, print an error
    } catch (error) {
        console.error("Error getting advisories");
    }
}

function selectCurrentWeek(scheduleWithDates) {
    const currentDate = new Date();
    let selectedWeekIndex = 0;

    console.log("scheduleWithDates:", scheduleWithDates); // Debugging

    for (let i = 0; i < scheduleWithDates.length; i++) {
        const weekDate = new Date(scheduleWithDates[i].date).getTime(); // Using getTime for comparison
        const currentDateTime = currentDate.getTime();

        console.log(`Week ${i + 1} Date:`, weekDate, "Current Date:", currentDateTime); // Debugging output

        if (weekDate > currentDateTime) {
            selectedWeekIndex = i;
            break;
        } else {
            selectedWeekIndex = i;
        }
    }

    if (selectedWeekIndex >= 0 && selectedWeekIndex < scheduleWithDates.length) {
        const weekDropdown = document.getElementById("weekDropdown");
        weekDropdown.value = selectedWeekIndex;
        displayWeekMatchups();
    } else {
        console.error("Invalid selected week index");
    }

    document.getElementById("current-week").innerHTML = selectedWeekIndex + 1;
}

//async function checkAdvisories() {
  //  const querySnapshot = await getDocs(collection(db, "advisory-olympics"));
   // querySnapshot.forEach((doc) => {
   //     console.log(doc.id);
   // });
//}

//checkAdvisories();

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString();
//display the date in the div
document.getElementById("date-display").innerHTML = formattedDate;
//call the fetch function
getAdvisories();

window.saveManualDates = saveManualDates;
window.generateWeekDateInputs = generateWeekDateInputs;
window.setTotalWeeks = setTotalWeeks;
//window.onload = function () {
    //generateWeekDateInputs(totalWeeks);
//};
//TO DO:
//Fix current week and date
//Make schedule algorithm making more random
//Add home/away boolean to each advisory each week
