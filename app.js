const output = document.getElementById("output");

const API = "https://genify-ai.onrender.com/api";

let mode = "text";

function setMode(m) {
  mode = m;
}

async function login() {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  localStorage.setItem("token", data.token);

  document.getElementById("auth").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

async function generate() {
  const res = await fetch(API + "/ai/" + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      prompt: prompt.value
    })
  });

  const data = await res.json();
  output.innerText = JSON.stringify(data, null, 2);
}


window.onload = () => {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  }
};