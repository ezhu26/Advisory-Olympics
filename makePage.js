import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
        document.getElementById("advisoryName").innerHTML = sessionStorage.getItem("displayAdvisory");
        document.getElementById("advisorName").innerHTML = docSnap.data().advisorName;
        // if (doc.data().advisorName == undefined){
        // document.getElementById("advisorName").innerHTML = "please input";
        // }
        document.getElementById("email").innerHTML = docSnap.data().email;
        document.getElementById("advisorPic").src = docSnap.data().image;
        document.getElementById("advisorBio").innerHTML = docSnap.data().advisorBio;
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



        // var schedule = docSnap.data().schedule;
        const schedule = await getSchedule();
        // console.log(schedule);
        // console.log("getSchedule called on")
        // console.log(schedule.opponent)
        var scheduleList = document.getElementById("schedule");
        // console.log(scheduleList);
            schedule.forEach((game) => {
                // console.log(game.week)
                // console.log(week.outcome);
                // console.log(docSnap.data())
                let newDiv = document.createElement("div");
                var newLi = document.createElement("li");
                newLi.id = game.id;
                if(game.home){
                    newLi.innerHTML = `Week ${game.week}: Home ${game.opponent} (Date: ${game.date})`;
                } else {
                    newLi.innerHTML = `Week ${game.week}: Away ${game.opponent} (Date: ${game.date})`;

                }
                // console.log(`${week}: ${schedule[week].opponent} (Date: ${schedule[week].date})`);
                // console.log(newLi.innerHTML);
                scheduleList.appendChild(newLi);

                if (!game.outcome) {  // Covers "", null, and undefined
                    let outcome = document.createElement("P");
                    outcome.id = "outcome";
                    outcome.innerHTML = "Game not completed";
                    outcome.style.color = "grey";
                    newLi.appendChild(outcome);
                } else if (game.outcome === "win") {
                    let outcome = document.createElement("P");
                    outcome.id = "outcome";
                    outcome.innerHTML = "Win";
                    outcome.style.color = "green";
                    newLi.appendChild(outcome);
                } else if (game.outcome === "loss") {
                    let outcome = document.createElement("P");
                    outcome.id = "outcome";
                    outcome.innerHTML = "Loss";
                    outcome.style.color = "red";
                    newLi.appendChild(outcome);
                } else if (game.outcome === "tie") {
                    let outcome = document.createElement("P");
                    outcome.id = "outcome";
                    outcome.innerHTML = "Tie";
                    outcome.style.color = "yellow";
                    newLi.appendChild(outcome);
                }
                
        });
        document.getElementById("history").innerHTML = docSnap.data().history;

        //adds the string from firebase and sets it as the src for the advisor image
        document.getElementById("advisorPic").src = docSnap.data().image;
        getSchedule();
}

//creates an advisory list and adds it to advisories.html
 export async function advisoryList(){
    // console.log("starts advisoryList function");
    // gets the documents from this query(if a field matches a given criteria)
    const advisories = await getDocs(collection(db, "advisory-olympics"));    
    console.log(advisories)
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
}


//when the user hovers over the dropdown element, it calls these functions
document.getElementById("dropdown").addEventListener("mouseover",  function() {
    // console.log("advisories clicked");
    // console.log("advisories opened");
    openDropdown();
    advisoryList();
});

//When openDropdown is called it shows the contents of the dropdown
export async function openDropdown() {
    // console.log("function openDropdown")
    document.getElementById("myDropdown").classList.toggle("show");
  }



//makes whatever its called on editable
export async function allowEdit (id){

    let parentDiv = document.getElementById(id);
    //children is a list of all of the children "P", "H1", etc. of the parent div
    let children = parentDiv.children;

    //Creates a button, sets the innerHTML, ad appends it to the parent div
    var editButton = document.createElement("button");
    editButton.id = "editButton";
    editButton.innerHTML = "edit";
    document.getElementById(id).appendChild(editButton);

    //changes any element that has a tag "P" and changes it to a text box
    editButton.onclick = function() {

        // if(!document.getElementById("submitButton")){
            console.log("creating submit button");
            var submitButton = document.createElement("button");
            submitButton.innerHTML = "submit";
            submitButton.id = "submitButton";

            editButton.replaceWith(submitButton);

        //Checks if a text area already exists so it won't make another one
        if(children.tagName !== "TEXTAREA"){
            for (let child of children) {
                if (child.tagName == "P"){
            //any element with p as its tag will be se as oldElement
            let oldElement = document.getElementById(child.id);
            console.log("changing to text area");
            //create a new element with textarea as its tag
            let newElement = document.createElement("textarea");
            newElement.id = oldElement.id;
            //sets the content of the oldElement into the new one
            newElement.innerHTML = oldElement.innerHTML;
            //reaplces old element with new one
            oldElement.replaceWith(newElement);
            }
        }
    }

        
//when the submit button is clicked, update fire base, reload the page, and remove the buttons
    submitButton.onclick = async function(){

        //checks the id to see which section to update and updates the doc on firebase
        if (id == "advisorSection"){
            await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                advisorBio: document.getElementById("advisorBio").value
            });
        } else if (id == "gameSection"){
            await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
               gameDesc: document.getElementById("gameDesc").value
            });
        }
            //reverts the text areas back into "p"'s
            let parentDiv = document.getElementById(id);
            //children is a list of all of the children "P", "H1", etc. of the parent div
            let children = parentDiv.children;
            for (let child of children) {

                //checks if the element is a text area
                if (child.tagName == "TEXTAREA"){
            //any element with text area as its tag will be se as oldElement
            let oldElement = document.getElementById(child.id);
            //create a new element with p as its tag
            let newElement = document.createElement("p");
            //sets the content of the oldElement into the new one
            newElement.innerHTML = oldElement.innerHTML;

            oldElement.replaceWith(newElement);
                }
            }
            //removes the buttons
            document.getElementById("submitButton").remove();
            //reloads the page
            location.reload()
        }
    }
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

export async function setScore(){
    const schedule = await getSchedule();
    // let scheduleList = document.querySelectorAll("#schedule li");
    console.log(schedule)
    console.log("setScore function starting");

    const collectionRef = collection(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule");
    //references the subcollection
    const scheduleSnapShot = await getDocs(collectionRef);

    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const docSnap = await getDoc(docRef);

    // let children = document.getElementById("schedule").children;
    // for (let child of children){
    //     if (child.tagName == "P"){
    //         console.log("removing P's");
    //         child.remove();
    //     }
    // }

    for (let game in schedule) {
        let gameLi = document.getElementById(game.id);
        document.getElementById("outcome").remove();
        console.log("removing the outcomes");

        let selectOutcome = document.createElement("SELECT");
        selectOutcome.id = game.id + "dropdown";
        selectOutcome.textContent = game.outcome

        option1 = document.createElement("option");
        option1.value = "win";
        option1.textContent = "Win";
        selectOutcome.appendChild(option1);



        gameLi.appendChild(selectOutcome);
    }
}

// export async function setScore(){
//     const schedule = await getSchedule();
//     let scheduleList = document.querySelectorAll("#schedule li");
//     // console.log(scheduleList)
//     console.log("setScore function starting");

//     const docRef = collection(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
//     //gets the documents from this query(if a field matches a given criteria)
//     //waits until the q variable is equal to a document in the database
//     const docSnap = await getDoc(docRef);

//     schedule.forEach((game) => {
//         // console.log(game.week)
//         //gets the gameLi so you can add buttons later on
//         let gameLi = document.getElementById(game.id);
//         document.getElementById("outcome").remove();

//         // console.log(game.name);
//         // console.log(game.outcome);
//         // let gameName = game.name
//         // console.log(game.opponent);
//         let winButton = document.createElement("button2");
//         winButton.style.backgroundColor = localStorage.getItem("WinButtonColor" + game.name)
//         winButton.innerHTML = "Win"

//         winButton.onclick = async function(){
//             if (!game.outcome){
//                 let currentScore = docSnap.data().record
//                 let newScore = addWin(currentScore);
//                 await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                     //adds into firebase
//                     record: newScore,
//                 });

//                 await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule", game.id), {    
//                     //adds into firebase
//                     outcome: "win",
//                 });
//                 // console.log(gameName.outcome);
//                 winButton.style.backgroundColor = "green";
//                 localStorage.setItem("WinButtonColor" + game.week, "green");
//             } else if (game.outcome == "loss"){
//                 let currentScore = docSnap.data().record
//                 let newScore = addWinWithLoss(currentScore);
//                 await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                     //adds into firebase
//                     record: newScore,

//                 });
//                 // console.log(gameName.outcome);
//                 winButton.style.backgroundColor = "green";
//                 localStorage.setItem("LossButtonColor"+game.week, "white");
//                 localStorage.setItem("WinButtonColor" + game.week, "green");
//             } else if (game.outcome = "tie"){
//                 let currentScore = docSnap.data().record
//                 let newScore = addWinWithTie(currentScore);
//                 await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                     //adds into firebase
//                     record: newScore,

//                 });
//                 // console.log(gameName.outcome);
//                 winButton.style.backgroundColor = "green";
//                 localStorage.setItem("TieButtonColor"+game.week, "white");
//                 localStorage.setItem("WinButtonColor" + game.week, "green");
//             }
//         }

//         let lossButton = document.createElement("button2");
//         lossButton.innerHTML = "Loss"
//         lossButton.style.backgroundColor = localStorage.getItem("LossButtonColor" + game.name)

//         lossButton.onclick = async function(){
//             if(!game.outcome){
//             let currentScore = docSnap.data().record
//             let newScore = addLoss(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             lossButton.style.backgroundColor = "red";
//             localStorage.setItem("LossButtonColor" + game.week, "red");
//             } else if (game.outcome = "Win"){
//             let currentScore = docSnap.data().record
//             let newScore = addLossWithWin(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             lossButton.style.backgroundColor = "red";
//             localStorage.setItem("WinButtonColor" + game.week, "white");
//             localStorage.setItem("LossButtonColor" + game.week, "red");
//         } else if (game.outcome == "tie"){
//             let currentScore = docSnap.data().record
//             let newScore = addLossWithTie(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             lossButton.style.backgroundColor = "red";
//             localStorage.setItem("TieButtonColor" + game.week, "white");
//             localStorage.setItem("LossButtonColor" + game.week, "red");
//         }
//     }

//         let tieButton = document.createElement("button2");
//         tieButton.innerHTML = "tie"
//         tieButton.style.backgroundColor = localStorage.getItem("TieButtonColor" + game.name)

//         tieButton.onclick = async function(){
//         if(!game.outcome){

//             let currentScore = docSnap.data().record
//             let newScore = addTie(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             tieButton.style.backgroundColor = "yellow";
//             localStorage.setItem("TieButtonColor" + game.week, "yellow");
        
//     } else if (game.outcome = "win"){
//         let currentScore = docSnap.data().record
//             let newScore = addTieWithWin(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             tieButton.style.backgroundColor = "yellow";
//             localStorage.setItem("WinButtonColor" + game.name, "white");
//             localStorage.setItem("TieButtonColor" + game.name, "yellow");
//     } else if (docSnap.data().outcome = "Loss"){
//         let currentScore = docSnap.data().record
//             let newScore = addTieWithLoss(currentScore);
//             await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
//                 //adds into firebase
//                 record: newScore
//             });
//             tieButton.style.backgroundColor = "yellow";
//             localStorage.setItem("LossButtonColor" + game.name, "white");
//             localStorage.setItem("TieButtonColor" + game.name, "yellow");
//     }
// }
//         gameLi.appendChild(winButton);
//         gameLi.appendChild(lossButton);
//         gameLi.appendChild(tieButton);
//     });
//     let submitButton = document.createElement("button");
//     submitButton.innerHTML = "Submit"
//     submitButton.onclick = function(){
//         location.reload();
//     }

//     document.getElementById("schedule").appendChild(submitButton);

// }
// localStorage.setItem("LossButtonColor" + "week1", white);


function addWin(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[0] += 1; // Increment the wins (first number)
    return scores.join("-"); // Convert back to string
}

function addWinWithLoss(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[0] += 1; // Increment the wins (first number)
    score[2] -= 1; //decrease the loss (second number)
    return scores.join("-"); // Convert back to string
}

function addWinWithTie(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[0] += 1; // Increment the wins (first number)
    score[1] -= 1; //decrease the tie (second number)
    return scores.join("-"); // Convert back to string
}

function addLoss(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[2] += 1; // Increment the Loss (third number)
    return scores.join("-"); // Convert back to string
}
function addLossWithWin(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[2] += 1; // Increment the Loss (third number)
    scores[0] -= 1;
    return scores.join("-"); // Convert back to string
}
function addLossWithTie(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[2] += 1; // Increment the Loss (third number)
    scores[1] -= 1;
    return scores.join("-"); // Convert back to string
}

function addTie(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[1] += 1; // Increment the ties (second number)
    return scores.join("-"); // Convert back to string
}
function addTieWithWin(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[1] += 1; // Increment the ties (second number)
    score[0] -= 1;
    return scores.join("-"); // Convert back to string
}
function addTieWithLoss(score) {
    let scores = score.split("-").map(Number); // Convert "5-0-2" into [5, 0, 2]
    scores[1] += 1; // Increment the ties (second number)
    score[2] -= 1;
    return scores.join("-"); // Convert back to string
}


//     async function addOutcome() {
//         const schedule = getSchedule();
//         const collectionRef = collection(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule");
//         const scheduleSnapShot = await getDocs(collectionRef); // Fetch all docs in the subcollection
    
//         schedule.forEach(async (gameDoc) => { // Loop through each document
//             const gameData = gameDoc.data(); // Get document data
//             const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"), "schedule", gameDoc.id);
    
//             if (!gameData.hasOwnProperty("outcome")) { // Check if "outcome" field is missing
//                 await updateDoc(docRef, { outcome: "" }); // Add an empty "outcome" field
//             }
//         });
//     }

    
// addOutcome();









