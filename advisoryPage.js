function openMail(){
    // Create a new div element
    const newDiv = document.createElement("div");

    // Optionally, add a class or id to the div
    newDiv.className = "mail";
    newDiv.id = "my-id";

    // Set some content or style for the div
    newDiv.textContent = "Hello, World!";
    newDiv.style.backgroundColor = "lightblue";
    newDiv.style.width = "200px";
    newDiv.style.height = "100px";

    // Append the div to an existing element in the document
    document.body.appendChild(newDiv); // Adds the div to the end of the <body>

}