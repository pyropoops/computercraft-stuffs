function post(url, data) {
  let http = new XMLHttpRequest();
  http.open("POST", url);
  http.setRequestHeader("Content-Type", "application/json");
  http.send(JSON.stringify(data));
}

async function getTurtles() {
  let s = await (await fetch("http://localhost:6969/turtles")).text();
  return JSON.parse(s);
}

async function call(exec) {
  let turtles = await getTurtles();
  let turtle = turtles[0];
  post(`http://localhost:6969/turtles/${turtle}`, {
    exec: exec,
  });
}

let turnLeft = document.getElementById("turnLeft");
turnLeft.onclick = () => {
  call("turnLeft");
};

let fuck = document.getElementById("fuck");
fuck.onclick = () => {
  call("fuck");
};
