document.addEventListener("DOMContentLoaded" , () => {
    // Wait until the DOM is fully loaded.

    // Get references to the input field , add button & the task list element.
    // document.getElementById() gives only the references.
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("addBtn");
    const taskList = document.getElementById("task-list");

    // Function to handle adding a new task.
    function addTask() {

        // Retrieve and trim whitespace from the task input value.
        const taskText = taskInput.value.trim();

        // If the input field is empty , alert the user & stop function execution.
        if (taskText === "") {
            alert("Please add a task!");
            return; // Exit the function early.
        }

        // Create a new list item (li) element to represent the task.
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";  // Assigned the class name here ,for CSS styling.

        // Create a span element to hold the task text.
        const taskContent = document.createElement("span");  // span is used to display task text and style  diffferent from others.
        taskContent.textContent = taskText; // Set the span's text to the input value.

        // Create a button element for deleting the task.
        deleteBtn = document.createElement("delBtn"); // Create the button element.
        deleteBtn.textContent = "Delete";  // Set the button's text for display , so that one can delete.
        deleteBtn.className = "delete-btn"; // Assigned a class name for CSS styling.

        // Append the task content & delete button to the list item.
        taskItem.appendChild(taskContent);
        taskItem.appendChild(deleteBtn);

        // Append the complete task item to the task list.
        taskList.appendChild(taskItem);

        // Clear the input field for the next task.
        taskInput.value = "";

        // Add a click event listener to the task content span.
        // This toggles a "completed" class & alerts the user when the task is clicked.
        taskContent.addEventListener("click" , () => {
            taskItem.classList.toggle("completed");  // Togggle "completed" class for the task item.
            alert("You completed your task , Well Done!"); // Congratulate the user for completing the task.
        });


        // Add a click event listener to the delete button.
        // This removes a task item from the task list when the button is clicked.
        deleteBtn.addEventListener("click" , () => {
            taskList.removeChild(taskItem); // Remove the task item from the DOM.
        });
}

// Add a click event listener to the "addTask()" buttton.
// This will call the addTask function when the button is clicked.
addTaskBtn.addEventListener("click" , addTask);


// Add a keypress event listener to the input field.
// This will call the addTask function when the "Enter" key is clicked.
taskInput.addEventListener("keypress" , (event) => {
    if (event.key === "Enter") {
        addTask();  // Call the addTask() function when the "Enter" key is clicked.
    }
});
});
