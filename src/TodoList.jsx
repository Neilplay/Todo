import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [filter, setFilter] = useState("all");
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("theme") === "dark"
    );

    // Fetch tasks from API
    useEffect(() => {
        fetchTasks();
        document.body.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/tasks/");
            console.log("Fetched tasks:", response.data); // Debugging
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error.response ? error.response.data : error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []); // This call is kept as the only fetch

    const addTask = async () => {
        if (task.trim() === "") return;

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/tasks/", {
                text: task,   // Use "text" instead of "title" to match Django model
                completed: false,
            });

            setTasks([...tasks, response.data]);
            setTask("");  // Clear input after adding
        } catch (error) {
            console.error("Error adding task:", error.response ? error.response.data : error);
        }
    };

    const removeTask = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`);
            setTasks(tasks.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const toggleComplete = async (id, completed) => {
        const taskToUpdate = tasks.find(task => task.id === id);
        if (!taskToUpdate) return;

        try {
            const response = await axios.put(`${API_URL}${id}/`, {
                text: taskToUpdate.text,  // Ensure text is sent
                completed: !completed,    // Toggle completed status
            });

            setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
        } catch (error) {
            console.error("Error toggling task:", error.response ? error.response.data : error);
        }
    };


    const startEditing = (id, text) => {
        setEditIndex(id);
        setEditedTask(text);
    };

    const saveEdit = async (id) => {
        if (editedTask.trim() === "") return;
        try {
            const response = await axios.put(`${API_URL}${id}/`, { text: editedTask }); // Changed 'title' to 'text'
            setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
            setEditIndex(null);
        } catch (error) {
            console.error("Error updating task:", error); // Consider adding user feedback here
        }
    };

    const cancelEdit = () => {
        setEditIndex(null);
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
    });

    return (
        <div className="app-container">
            <h2>To-Do List</h2>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="todo-container">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                />
                <button onClick={addTask}>Add Task</button>
                <div className="filters">
                    <button onClick={() => setFilter("all")}>All</button>
                    <button onClick={() => setFilter("completed")}>Completed</button>
                    <button onClick={() => setFilter("pending")}>Pending</button>
                </div>
                <ul>
                    {filteredTasks.map((t) => (
                        <li key={t.id} className={t.completed ? "completed" : ""}>
                            <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => toggleComplete(t.id, t.completed)}
                            />
                            {editIndex === t.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedTask}
                                        onChange={(e) => setEditedTask(e.target.value)}
                                    />
                                    <button onClick={() => saveEdit(t.id)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span>{t.text}</span> {/* Changed from t.title to t.text */}
                                    <button onClick={() => startEditing(t.id, t.text)}>Edit</button>
                                    <button onClick={() => removeTask(t.id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
