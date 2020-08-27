var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks")); // get the tasks from 

  // if nothing in localStorage, create a new object to track all task status arrays
  // if tasks IS equal to NULL/undefined 
  if (!tasks) {  // curly brace = object
    tasks = {  // make tasks value 0 instead of null (empty arrays instead of null)
      toDo: [],  // brackets = array
      inProgress: [], // creates arrays in all these categories
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) { // list = a key, arr is empty
    // then loop over sub-array
    arr.forEach(function (task) {  // for each array in the values of my object execute
      createTask(task.text, task.date, list); // uses list name to put it in the right column /what you type in
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
// list-group is the class name inside the ul
// we call .list-group with an .on("click") so that when "p" is clicked the function
//will console log the words in ()
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text() //jQuery methods can be chained together or stacked like this:
    .trim(); //gets rid of white space

  // console.log(text); // this gets the inner text content (what's been written) of the current element
  var textInput = $("<textarea>") //$() = tells jQuery to find all <textarea> elements by element name
    //$(<>) = tells jQ to create a new <> element using HTML tags to indicate element to be created
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput); // replace "p" from above to <textarea> 
  //You can write in it TextInput
  textInput.trigger("focus"); // highlights the input box when triggered by click
  // change the words in the console.log to (this)= refers to actual elements
  //What is m-1 ???
  // console.log(this)
});
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", ""); // find and replace text in a string

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  //automatically focus on anew element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function () {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

$(".card .list-group").sortable({ //sortable turns every element in the list group into a sortable list
  connectWith: $(".card .list-group"), // connectWith links these sortable lists with any other list with the same class
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    console.log("activate", this);
  },
  deactivate: function (event) {
    console.log("deactivate", this);
  },
  over: function (event) { // item enters the list
    console.log("over", event.target);
  },
  out: function (event) { // item leaves the list
    console.log("out", event.target);
  },
  update: function (event) { // when contents of a list have changed
    var tempArr = [];

    // loop over current se of children in sortable list
    $(this).children().each(function () {
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text:text,
        date:date
      });
    });
    console.log(tempArr);

    var arrName = $(this)
    .attr("id")
    .replace("list-", "")

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop")
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
})
  // load tasks for the first time
  loadTasks();


