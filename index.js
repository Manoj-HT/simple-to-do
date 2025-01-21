const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = "todos.json";

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const readTodos = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

const writeTodos = (todos) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
};

const execute = {
    '': sendIndex,
    '/': sendIndex,
    '/get-todos': getTodos,
    '/post-todos': postTodos,
    '/delete-todo': deleteTodo,
}

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const func = execute[url]
    func(req, res);
    if (func == undefined) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});

function sendIndex(req, res) {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error: Unable to load index.html");
            return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
    });
}

function getTodos(req, res) {
    const todos = readTodos();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(todos));
}

function postTodos(req, res) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
        const { title } = JSON.parse(body);
        if (!title) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Title is required" }));
            return;
        }

        const todos = readTodos();
        const newTodo = { id: Date.now(), title, completed: false };
        todos.push(newTodo);
        writeTodos(todos);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newTodo));
    });
}

function deleteTodo(req, res) {
    const id = url.split("/")[2];
    const todos = readTodos();
    const filteredTodos = todos.filter((todo) => todo.id != id);
    if (todos.length === filteredTodos.length) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Todo not found" }));
        return;
    }
    writeTodos(filteredTodos);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo deleted successfully" }));
}

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
