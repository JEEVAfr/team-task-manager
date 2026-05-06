import React, { useEffect, useState } from "react";
import axios from "axios";


const API = "https://team-task-manager-production-8362.up.railway.app";

function App() {

  // 🔐 AUTH STATES
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // 📦 DATA STATES
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newProject, setNewProject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [selectedProject, setSelectedProject] = useState(1);

  // 🔹 LOGIN
  const handleLogin = () => {
    axios.post(`${API}/api/login/`, { username, password })
      .then(res => {
        const t = res.data.access;
        localStorage.setItem("token", t);
        setToken(t);
      })
      .catch(() => alert("Login failed"));
  };

  // 🔹 SIGNUP
  const handleSignup = () => {
    axios.post(`${API}/api/register/`, { username, password })
      .then(() => {
        alert("Signup successful!");
        setIsLogin(true);
      })
      .catch(() => alert("Signup failed"));
  };

  // 🔹 FETCH DATA
  useEffect(() => {
    if (!token) return;

    axios.get(`${API}/api/projects/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setProjects(res.data))
    .catch(() => {
      alert("Session expired. Please login again.");
      handleLogout();
    });

    axios.get(`${API}/api/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setTasks(res.data))
    .catch(() => {
      alert("Session expired. Please login again.");
      handleLogout();
    });

  }, [token]);

  // 🔹 LOGOUT (METHOD 1 ✅)
  const handleLogout = () => {
    localStorage.removeItem("token");   // 🔥 THIS IS METHOD 1
    setToken(null);
  };

  // 🔹 CREATE PROJECT
  const createProject = () => {
    if (!newProject) return;

    axios.post(`${API}/api/projects/`,
      {
        name: newProject,
        created_by: 1,
        members: [1],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(res => {
      setProjects([...projects, res.data]);
      setNewProject("");
    });
  };

  // 🔹 CREATE TASK
  const createTask = () => {
    if (!newTask) return;

    axios.post(`${API}/api/tasks/`,
      {
        title: newTask,
        description: "From UI",
        due_date: "2026-05-10",
        priority: "medium",
        status: "todo",
        project: selectedProject,
        assigned_to: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(res => {
      setTasks([...tasks, res.data]);
      setNewTask("");
    });
  };

  // 🔹 UPDATE TASK STATUS
  const updateTaskStatus = (id, newStatus) => {
    axios.patch(`${API}/api/tasks/${id}/`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(res => {
      setTasks(tasks.map(t => (t.id === id ? res.data : t)));
    });
  };

  // 🔴 LOGIN UI
  if (!token) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>{isLogin ? "Login" : "Signup"}</h2>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        {isLogin ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <button onClick={handleSignup}>Signup</button>
        )}

        <br /><br />

        <button onClick={() => setIsLogin(!isLogin)}>
          Switch to {isLogin ? "Signup" : "Login"}
        </button>
      </div>
    );
  }

  // 🔵 MAIN APP
  return (
    <div style={{ padding: "20px" }}>

      {/* ✅ LOGOUT BUTTON */}
      <button onClick={handleLogout}>Logout</button>

      <h2>Dashboard</h2>
      <p>Total Tasks: {tasks.length}</p>

      {/* CREATE PROJECT */}
      <h2>Create Project</h2>
      <input
        value={newProject}
        onChange={(e) => setNewProject(e.target.value)}
        placeholder="Project name"
      />
      <button onClick={createProject}>Create</button>

      {/* CREATE TASK */}
      <h2>Create Task</h2>
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Task title"
      />

      <select onChange={(e) => setSelectedProject(e.target.value)}>
        {projects.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <button onClick={createTask}>Create Task</button>

      {/* TASK LIST */}
      <h2>Tasks</h2>
      {tasks.map(t => (
        <div key={t.id}>
          📝 {t.title} | {t.status}
          <button onClick={() => updateTaskStatus(t.id, "in_progress")}>Start</button>
          <button onClick={() => updateTaskStatus(t.id, "done")}>Done</button>
        </div>
      ))}

    </div>
  );
}

export default App;