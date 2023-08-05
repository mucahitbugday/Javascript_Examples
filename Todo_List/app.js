const todoInput = document.getElementById('todoInput')
const todoInputEdit = document.getElementById('todoInputEdit')
const todoList = document.getElementById('todoList')
const savedTodosJSON = localStorage.getItem('todos')
const savedTodos = savedTodosJSON ? JSON.parse(savedTodosJSON) : []

for (const todo of savedTodos) {
    addTodoList(todo)
}

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === "") return

    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false,
    }

    savedTodos.push(todo)
    localStorage.setItem('todos', JSON.stringify(savedTodos));
    addTodoList(todo)
    todoInput.value = ''
}

function todoCheck(id) {
    const todo = savedTodos.find(todo => todo.id === id)
    todo.completed = !todo.completed
    localStorage.setItem('todos', JSON.stringify(savedTodos))
    const todoElemet = document.getElementById(id)
    todoElemet.classList.toggle("completed", todo.completed)
}

function todoEdit(id) {
    const todo = savedTodos.find(todo => todo.id === id)
    const newText = prompt("Düzenle", todo.text)
    if (newText !== null) {
        todo.text = newText.trim();
        localStorage.setItem('todos', JSON.stringify(savedTodos))
        const todoElemet = document.getElementById(id);
        todoElemet.querySelector('span').textContent = newText;
    }
}


function todoDelete(id) {
    const todoElemet = document.getElementById(id);
    todoElemet.style.animation = 'fadeOut 0.3s ease'
    setTimeout(() => {
        savedTodos.splice(savedTodos.findIndex(todo => todo.id === id), 1)
        localStorage.setItem('todos', JSON.stringify(savedTodos))
        todoElemet.remove()
    }, 300);
}

function addTodoList(todo) {
    const li = document.createElement("li")
    li.setAttribute('id', todo.id)
    li.innerHTML = `
    <span title = "${todo.text}">${todo.text}</span>
    <button onclick="todoCheck(${todo.id})"><i class="fa-solid fa-check"></i></button>
    <button onclick="todoEdit(${todo.id})"><i class="fa-solid fa-pen-to-square"></i></button>
    <button onclick="todoDelete(${todo.id})"><i class="fa-solid fa-trash"></i></button>
    `
    li.classList.toggle('completed', todo.completed);
    // todoList.appendChild(li)
    todoList.appendChild(li)
}
