import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import{updateTeamRecord} from "./standings.js";

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


//allows it to import it to html
export async function buildAdvisoryPage(){
    // console.log("running build advisory function");
    //look in the adcisory-olympics data base where it looks to see if the advisor name
    // is equal to session storage advisor name
    // console.log(sessionStorage.getItem("displayAdvisory"));
    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const docSnap = await getDoc(docRef);
    // console.log(docSnap.id);
    //loops through each doc in the querySnapshot
        // doc.data() is never undefined for query doc snapshots
        // console.log(docSnap.id, " => ", docSnap.data());
                //doc.data().field name
        //sets the inner html as the data from fire base
        // document.getElementById("advisoryName").innerHTML = sessionStorage.getItem("displayAdvisory");
        document.getElementById("advisoryName").innerHTML = docSnap.data().name;

        document.getElementById("advisorName").innerHTML = docSnap.data().advisorName;
        // if (doc.data().advisorName == undefined){
        // document.getElementById("advisorName").innerHTML = "please input";
        // }
        document.getElementById("email").innerHTML = docSnap.data().email;
        var roster = docSnap.data().roster;
        var rosterList = document.getElementById("roster");
             //loops through each variable in the roster field
            roster.forEach((student) => {
                //creates a new line in the list and sets the 
                //information to the variable, and adds it to the list
                var newLi = document.createElement("li");
                newLi.innerHTML = student;
                // newDiv.appendChild(newLi)
                newLi.id = student;
                rosterList.appendChild(newLi);
            });
        document.getElementById("gameName").innerHTML = docSnap.data().gameName;
        document.getElementById("gameDesc").innerHTML = docSnap.data().gameDesc;
        document.getElementById("advisorName").innerHTML = docSnap.data().advisorName;
        document.getElementById("score").innerHTML = docSnap.data().record;
        document.getElementById("location").innerHTML = docSnap.data().location;


        // var schedule = docSnap.data().schedule;
const schedule = await getSchedule();

const firstHalfList = document.getElementById("first-half");
const secondHalfList = document.getElementById("second-half");

if (!firstHalfList || !secondHalfList) {
  console.error("Missing #first-half or #second-half UL in your HTML.");
}

const halfway = Math.ceil(schedule.length / 2);

schedule.forEach((game, index) => {
  // Create LI to contain everything
const li = document.createElement("li");
li.className = "gameDiv"; // Flex styling goes here

const info = document.createElement("span");
info.textContent = game.home
  ? `Week ${game.week}: Home ${game.opponent}`
  : `Week ${game.week}: Away ${game.opponent}`;

const outcome = document.createElement("span");
outcome.className = 'outcome outcome-${index}';

switch (game.outcome) {
  case "win":
    outcome.textContent = "Win";
    outcome.style.color = "green";
    break;
  case "lose":
    outcome.textContent = "Loss";
    outcome.style.color = "red";
    break;
  case "tie":
    outcome.textContent = "Tie";
    outcome.style.color = "goldenrod";
    break;
  default:
    outcome.textContent = "Not completed";
    outcome.style.color = "gray";
}

li.appendChild(info);
li.appendChild(outcome);

// Append to the right list
(index < halfway ? firstHalfList : secondHalfList).appendChild(li);

});

        //adds the string from firebase and sets it as the src for the advisor image
        // document.getElementById("advisorPic").src = docSnap.data().image;
        // console.log(scheduleList);
        // getSchedule();
}

//creates an advisory list and adds it to advisories.html
export async function makeDropdown(){
    console.log("starts advisoryList function");
    // gets the documents from this query(if a field matches a given criteria)
    const advisories = await getDocs(collection(db, "advisory-olympics"));    
    // console.log(advisories)
    //loops through each advisory    
    advisories.forEach((advisory) => {
        // console.log("advisory")
        //makes a button and sets the info the the name of the advisory
        let newA = document.createElement("button");
        newA.classList.add('advisory');
        //creates the innerHTML as the advisory name
        newA.innerHTML = advisory.data().name;
        let dropdown = document.getElementById("myDropdown");
        //adds the new A to the dropdown 
        dropdown.appendChild(newA);
        newA.id = advisory.data().name;

        //if the button in clicked call the makePage.html which calls the build advisory function
        //sets the session storage 
        newA.onclick = function() {
            // console.log("Setting session storage");
            sessionStorage.setItem("displayAdvisory", advisory.id);
           
            // console.log("Changing pages");
            window.location.href="makePage.html";
        }
    });
    // openDropdown()
}

//when the user hovers over the dropdown element, it calls these functions
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("dropdown");
  const dropdown = document.getElementById("myDropdown");
  const container = document.getElementById("dropdown-container");
  // Show dropdown on hover
  button.addEventListener("mouseover", () => {
    console.log("user hover");
    dropdown.classList.add("show");
  });

  // Keep it open when hovering over dropdown
  dropdown.addEventListener("mouseover", () => {
    dropdown.classList.add("show");
  });

  // Hide when mouse leaves the whole container
  container.addEventListener("mouseleave", () => {
    dropdown.classList.remove("show");
  });
});

window.addEventListener("DOMContentLoaded", () => {
//   const showAdvisor = sessionStorage.getItem("adminLogin");

//   if (showAdvisor == "true") {

    // <li id = "left" ><button class = "advisorbutton" onclick="handleAdvisorClick()">Advisor</button></li>

    let newLi = document.createElement("li");
    newLi.id = "left";
    let advisorButton = document.createElement("button");
    advisorButton.onclick = handleAdvisorClick;
    advisorButton.innerHTML = "Advisor"
    newLi.appendChild(advisorButton);
    document.getElementById("navBar").appendChild(newLi);
//   }
});



// //When openDropdown is called it shows the contents of the dropdown
// export function openDropdown() {
//     console.log("function openDropdown")
//     // advisoryList();

//     document.getElementById("myDropdown").classList.toggle("show");
//   }




//makes whatever its called on editable
export async function allowEdit (){

    // let parentDiv = document.getElementById("advisorSection");
    //children is a list of all of the children "P", "H1", etc. of the parent div
    // let children = parentDiv.children;

    //Creates a button, sets the innerHTML, ad appends it to the parent div
    var editButton = document.createElement("button");
    editButton.id = "editButton";
    editButton.innerHTML = "edit";
    document.getElementById("advisorSection").appendChild(editButton);


    //changes any element that has a tag "P" and changes it to a text box
    editButton.onclick = function() {

//sets the already existing information into the form
            console.log("opening modal");
            document.getElementById("advisorNameInput").value = document.getElementById("advisorName").textContent;
            document.getElementById("emailInput").value = document.getElementById("email").textContent;
            document.getElementById("locationInput").innerHTML = document.getElementById("location").textContent
            document.getElementById("gameNameInput").innerHTML = document.getElementById("gameName").innerHTML;
            document.getElementById("gameDescInput").innerHTML = document.getElementById("gameDesc").innerHTML;

            document.getElementById("editModal").style.display = "block";
    }
}
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  await saveInfo();   // Save form data to Firebase

  document.getElementById("editModal").style.display = "none"; // Close modal
  location.reload();
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

async function saveInfo(){
    await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {
        advisor: document.getElementById("advisorNameInput").value,
        email: document.getElementById("emailInput").value,
        location: document.getElementById("locationInput").innerHTML,
        gameName: document.getElementById("gameNameInput").innerHTML,
        gameDesc:document.getElementById("gameDescInput").innerHTML
    });
    console.log("all info saved into firebase");
}

//makes whatever its called on editable
export async function editAdvisoryName(id) {
    let changeElement = document.getElementById(id);

    // Create edit button
    let editButton = document.createElement("button");
    editButton.id = "editButton";
    editButton.innerHTML = "edit";
    changeElement.parentElement.appendChild(editButton); // safer append

    editButton.onclick = function () {
        console.log("creating submit button");

        let submitButton = document.createElement("button");
        submitButton.innerHTML = "submit";
        submitButton.id = "submitButton";

        editButton.replaceWith(submitButton);

        if (changeElement.tagName !== "TEXTAREA") {
            let oldElement = document.getElementById(id);
            console.log("changing to text area");

            let newElement = document.createElement("textarea");
            newElement.id = oldElement.id;
            newElement.value = oldElement.textContent;

            oldElement.replaceWith(newElement);
        }

        submitButton.onclick = async function () {
            let updatedText = document.getElementById(id).value;

            await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {
                name: updatedText
            });

            let oldElement = document.getElementById(id);
            if (oldElement.tagName === "TEXTAREA") {
                let newElement = document.createElement("h1");
                newElement.id = oldElement.id;
                newElement.textContent = oldElement.value;

                oldElement.replaceWith(newElement);
            }

            submitButton.remove();
            location.reload();
        };
    };
}



//organizes each field containing "schedule" and sorts them by week
async function getSchedule(){
    // console.log("getSchedule is running")
    const collectionRef = collection(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule");
    //references the subcollection
    const scheduleSnapShot = await getDocs(collectionRef);


    let schedule = [];
    scheduleSnapShot.forEach((doc) => {
        if(doc.id.includes("week")){
            // schedule.push(doc.data())
        schedule.push({ id: doc.id, ...doc.data() }); // Store each document's data
        }
    });
    schedule.sort((a, b) => a.week - b.week);

    // console.log(schedule); 
    
    return schedule
}



//allows the advisor to edit the roster
//is able to remove students and add new ones
export async function editRoster(){
//puts all the li from the roster into a list
    var rosterList = document.querySelectorAll("#roster li");
    // console.log(rosterList);

    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const docSnap = await getDoc(docRef);
    //list of the roster list from firebase
    var roster = docSnap.data().roster;

//loops through each li and adds a delete button to each one
    rosterList.forEach((student) => {
        // console.log(student.id);
        let deleteButton = document.createElement("button3");
        deleteButton.innerHTML = "Delete";
        deleteButton.className = "deleteButton";

        let li = document.getElementById(student.id);
        li.appendChild(deleteButton);
        

        //removes the person from firebase and deletes the li element
        deleteButton.onclick = async function() {

                //removes the student name from the roster
                    roster = roster.filter(item => item !== student.id);
                    // console.log("roster list filtered");
                    // console.log(roster);

                    // Update the modified roster back to Firebase
                    await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                        roster: roster
                    });
                //removes the li             
            document.getElementById(student.id).remove();
            
        }
    });

    //creates add button
    let addButton = document.createElement("button2");
    addButton.id = "addPerson";
    addButton.innerHTML = "Add Student";

    //creates a submit button
    let submitButton = document.createElement("button2");
    submitButton.id = "submitButton2";
    submitButton.innerHTML = "Submit";
        
    //add both of the elements
    document.getElementById("rosterContainer").appendChild(addButton);
    document.getElementById("rosterContainer").appendChild(submitButton);
    
    
    //when the add button is clicked
    addButton.onclick = function(){

        //checks to see if the textbox is already there so it won't add another one
        if(!document.getElementById("textBox")){

        //creates a text box
        var textBox = document.createElement("textarea");
        textBox.id = "textBox";
        textBox.placeholder = "Enter student name"; // Add placeholder text
        textBox.style.width = "200px"; // Set width
        textBox.style.height = "50px";
        document.getElementById("rosterContainer").appendChild(textBox);
        
        document.getElementById("rosterContainer").appendChild(submitButton);
        }
    }

//when the submit button is clicked
        submitButton.onclick = async function(){
            //remove any previous error messages
            if (document.getElementById("errorMessage")){
                document.getElementById("errorMessage").remove();
            }
            //if there is no text box element in the div, reload the page
            if (!document.getElementById("textBox")){
                console.log("there is no text box");
                location.reload();
            //checks to see if the text area is empty so it won't add a student without a name
            } else if (document.getElementById("textBox").value == ""){
                textBox.style.borderColor = "red";
                var errorMessage = document.createElement("P");
                errorMessage.id = "errorMessage";
                errorMessage.innerHTML = "Text area is empty";
                errorMessage.style.color = "red";
                //inserts error message before the submit button
                submitButton.insertAdjacentElement("beforebegin", errorMessage);

            //checks to see if the student is already in the roster
            } else if (roster.includes(document.getElementById("textBox").value)){
                textBox.style.borderColor = "red";
                var errorMessage = document.createElement("P");
                errorMessage.id = "errorMessage";
                errorMessage.innerHTML = "Students already exists";
                errorMessage.style.color = "red";
                submitButton.insertAdjacentElement("beforebegin", errorMessage);

            //if it passes all of those conditions, adds the student to firebase
            } else if(document.getElementById("textBox").value !== ""){
                await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                    //adds into firebase
                    roster: arrayUnion(document.getElementById("textBox").value)
                });

                //removes the submitbutton and text box
                document.getElementById("submitButton2").remove();
                document.getElementById("textBox").remove();
                location.reload();
            } else {
                location.reload();
            }
        }
}

//being able to put in the outcome of the game and get a school
export async function setScore(){
    //a list of the games in order by week
    const schedule = await getSchedule();

    const collectionRef = collection(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule");
    //references the subcollection
    const scheduleSnapShot = await getDocs(collectionRef);

    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const docSnap = await getDoc(docRef);
    let scheduleList = document.getElementById("schedule");
    // let newScheduleList = Array.from(scheduleList.children); // converts to a real array
    // console.log(newScheduleList);

    //removes all of the elements that have a class name of "outcome"
    // document.querySelectorAll(".outcome").forEach(el => el.remove());
    const outcomeList = document.querySelectorAll(".outcome");
    //makes a list of all the divs that have a class name "gameDiv"
    let gameDivList = document.querySelectorAll(".gameDiv");
    
    //runs through the gameDivList and the schedule list
    for (let i = 0; i < gameDivList.length && i < schedule.length && i < outcomeList.length; i++){

        //create a select element 
        let selectOutcome = document.createElement("select");
        selectOutcome.className = "selectOutcome";
        //makes the set one the outcome of the game
        selectOutcome.textContent = schedule[i].outcome;

        //creates option 1
        let option1 = document.createElement("option");
        option1.value = "not completed";
        option1.textContent = "Game Not Completed";
        selectOutcome.appendChild(option1);

        //creates option 2
        let option2 = document.createElement("option");
        option2.value = "win";
        option2.textContent = "Win";
        selectOutcome.appendChild(option2);

        //creates option 3
        let option3 = document.createElement("option");
        option3.value = "lose";
        option3.textContent = "Lose";
        selectOutcome.appendChild(option3);

        //creates option 4
        let option4 = document.createElement("option");
        option4.value = "tie";
        option4.textContent = "Tie";
        selectOutcome.appendChild(option4);

        //sets the value of the select option of the outcome, if there wasn't any selected automatically does it to "not completed"
        selectOutcome.value = schedule[i].outcome || "not completed";

        //append the dropdown to the div 
        outcomeList[i].replaceWith(selectOutcome);
    }

    //creates a submit button
    let submitButton = document.createElement("button");
    submitButton.id = "submitButton";
    submitButton.innerHTML = "Submit";
    scheduleList.appendChild(submitButton);
    //a list to store all the new values of the select options
    let newOutcomeList = [];
    submitButton.onclick = async function(){
        //a list of all the dropdown values
        let dropdowns = document.querySelectorAll(".dropdown");
        for (let i = 0; i < gameDivList.length && i < schedule.length && i < dropdowns.length; i++){
            newOutcomeList.push(dropdowns[i].value);
            //updates the outcome of the firebase
            const subDocRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule", schedule[i].id);
            await updateDoc(subDocRef, {
                outcome: dropdowns[i].value // or "lose", "tie", etc.
            });
        }

        //calculates the new score based on the values in the new outcome list
        let newScore = makeScore(newOutcomeList);

        //updates that string into firebase
        await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                record: newScore
            });
        //refreshes the screen
        updateTeamRecord();
        // calculatePoints(newScore);
        location.reload();
    }

}

//calculates the new score based on the new outcomes
function makeScore(outcomeList){
    let wins = 0;
    let losses = 0;
    let ties = 0;
    //loops through the list and calculates the number of wins, ties, and losses
    for (let i = 0; i < outcomeList.length; i++){
        if(outcomeList[i]=="win"){
            wins+=1;
        } else if (outcomeList[i]=="lose"){
            losses += 1
        } else if (outcomeList[i] == "tie"){
            ties+=1;
        }
    }
    //puts the numbers into the correct string format
    let newScore = wins + "-" + losses + "-" + ties;
    return newScore;
}

//makes it to make sure those functions don't run if the advisor button is clicked again
export function handleAdvisorClick() {
    // if (sessionStorage.getItem("advisorClicked") === "true") {
    if (document.getElementById("submitButton")){
      console.log("Already clicked – skipping function calls");
    //   location.reload();
    return
    }
    // sessionStorage.setItem("advisorClicked", "true");
    console.log("Running advisor functions");
    allowEdit('advisorSection');
    // allowEdit('gameSection');
    editRoster();
    setScore();
    editAdvisoryName('advisoryName');
    deleteAdvisory();
  }

export async function deleteAdvisory(){
    console.log("deleteAdvisory function running");
    let deleteAdvisoryButton = document.createElement("button");
    deleteAdvisoryButton.innerHTML = "Delete Advisory";
    deleteAdvisoryButton.className = "deleteAdvisoryButton";
    document.body.appendChild(deleteAdvisoryButton);
    deleteAdvisoryButton.onclick = async function(){
    try {
        await deleteDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")));
        console.log("Document successfully deleted!");
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
        window.location.href = "index.html";
    }
}
makeDropdown();

