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
                // let newDiv = document.createElement("div");
                // newDiv.className = student;
                // newDiv.id = student;
                var newLi = document.createElement("li");
                newLi.innerHTML = student;
                // newDiv.appendChild(newLi)
                newLi.id = student + "1";
                
                rosterList.appendChild(newLi);
            });
        document.getElementById("gameName").innerHTML = docSnap.data().gameName;
        document.getElementById("gameDesc").innerHTML = docSnap.data().gameDesc;
        document.getElementById("advisorName").innerHTML = docSnap.data().advisorName;



        // var schedule = docSnap.data().schedule;
        const schedule = await getSchedule();
        // console.log("getSchedule called on")
        // console.log(schedule.opponent)
        var scheduleList = document.getElementById("schedule");
        // console.log(scheduleList);
            schedule.forEach((week) => {
                // console.log(docSnap.data())
                var newLi = document.createElement("li");
                // console.log(week.data().opponent)
                
                // console.log(`${week}: ${schedule[week].opponent} (Date: ${schedule[week].date})`);
                newLi.innerHTML = `${week.name}: ${week.opponent} (Date: ${week.date})`;
                scheduleList.appendChild(newLi);
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
    // console.log(children);
    //let buttonLine = document.getElementById("buttons");
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
            // document.getElementById(id).appendChild(submitButton);
            // }
        editButton.replaceWith(submitButton);


        if(children.tagName !== "TEXTAREA"){
            for (let child of children) {
                //console.log(child.tagName);
                if (child.tagName == "P"){
            //any element with p as its tag will be se as oldElement
            let oldElement = document.getElementById(child.id);
            console.log("changing to text area");
            //create a new element with textarea as its tag
            let newElement = document.createElement("textarea");
            newElement.id = oldElement.id;
            //sets the content of the oldElement into the new one
            newElement.innerHTML = oldElement.innerHTML;

            oldElement.replaceWith(newElement);
            }
        }

    }
        //after the edit button is clicked it creates a submit button


        // console.log("end of edit button on click");
        
//when the submit button is clicked, update fire base, reload the page, and remove the buttons
    submitButton.onclick = async function(){
        console.log("submitButton clicked");

        if (id == "advisorSection"){
            await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                advisorBio: document.getElementById("advisorBio").value
            });
        } else if (id == "gameSection"){
            await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
               gameDesc: document.getElementById("gameDesc").value
            });
        }
            //updates the doc to whatever the user changed it to

            
            let parentDiv = document.getElementById(id);
            // console.log()
            //children is a list of all of the children "P", "H1", etc. of the parent div
            let children = parentDiv.children;
            for (let child of children) {
                // console.log(child.tagName);
                //checks if the element is a text area
                if (child.tagName == "TEXTAREA"){
            //any element with text area as its tag will be se as oldElement
            let oldElement = document.getElementById(child.id);
            //console.log(oldElement.innerHTML);
            //create a new element with p as its tag
            let newElement = document.createElement("p");
            //sets the content of the oldElement into the new one
            newElement.innerHTML = oldElement.innerHTML;

            oldElement.replaceWith(newElement);
                }
            }
            //removes the buttons
            document.getElementById("submitButton").remove();
            // document.getElementById("editButton").remove();
            //reloads the page
            location.reload()
        }
    }
}

//organizes each field containing "schedule" and sorts them by week
async function getSchedule(){
    // console.log("getSchedule is running")
    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() ; // Get all fields in the document
        // 🔍 Example: Search for a specific field
    //makes a list of fields
    let weekList = [];
    for (let field in data){
        if (field.includes("week")){
            // console.log(field);
            // console.log("Data:", data[field]);
            // console.log({ opponent: docSnap.data()[field]['opponent'], date: docSnap.data()[field]['date'] });
            // weekList.push({ opponent: field['opponent'], date: field['date'] });
            weekList.push({
                name: field,
                opponent: docSnap.data()[field]['opponent'],
                date: docSnap.data()[field]['date']
            })
            // weekList.push(field);
            // console.log(field);
        } else {
        // console.log("does not contain 'field'");
        }
    }
    // console.log(weekList)



    weekList.sort((a, b) => new Date(a.date) - new Date(b.date));
    // console.log(weekList);
    return weekList;
}



//allows the advisor to edit the roster
//is able to remove students and add new ones
export async function editRoster(){
//puts all the li from the roster into a list
    var rosterList = document.querySelectorAll("#roster li");

    const docRef = doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory"));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const docSnap = await getDoc(docRef);
    var roster = docSnap.data().roster;

//loops through each li and sets the background color and adds a delete button to each one
    rosterList.forEach((student) => {
        console.log(student.id);
        let deleteButton = document.createElement("button3");
        deleteButton.innerHTML = "Delete";
        deleteButton.className = "deleteButton";

        let li = document.getElementById(student.id);
        li.appendChild(deleteButton);
        // li.style.backgroundColor = "yellow";
        //when the delete button is clicked, remove it from firebase

        //NEED TO FIX
        deleteButton.onclick = async function() {
            console.log(student.id);
            for(let person in roster){
                if(person == student.id){
                    await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                        roster: arrayRemove(person)
                    });
                }
            }
            console.log(`${student} removed`);
            document.getElementById(student.id).remove();
        }
    });

    //creates add button and submit button
    let addButton = document.createElement("button2");
    console.log("button created");
    addButton.id = "addPerson";
    addButton.innerHTML = "Add Student";

    let submitButton = document.createElement("button2");
    submitButton.id = "submitButton2";
    submitButton.innerHTML = "Submit";
        
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
        console.log(document.getElementById("textBox").value);
        }
    }

//when the submit button is clicked
        submitButton.onclick = async function(){
            //remove any previous error messages
            if (document.getElementById("errorMessage")){
                document.getElementById("errorMessage").remove();
            }
            console.log("submit button clicked");
            //checks to see if the text box is empty so it can't enter a student without a name
            if (document.getElementById("textBox").value == ""){
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



            } else if (!document.getElementById("textBox")){
                console.log("there is no text box");
                location.reload();
                                //actually creates a new student and adds it to firebase

            }              else if(document.getElementById("textBox").value !== ""){

                await updateDoc(doc(db, "advisory-olympics", sessionStorage.getItem("displayAdvisory")), {    
                    roster: arrayUnion(document.getElementById("textBox").value)
                });
                console.log(`${document.getElementById("textBox").value} added to roster!`);
                document.getElementById("submitButton2").remove();
                document.getElementById("textBox").remove();
                location.reload();
            }
        }

    

}









