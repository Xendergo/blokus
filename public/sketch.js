const colors = ["#ff0000", "#009700", "#0000ff", "#ADAD00", "#522348", "#7A7A7A"];
const names = ["red", "green", "blue", "yellow"];

const ws = new WebSocket(`ws://${location.host}/websockets`);

let selectedPolymino = 0;

let firstMove = true;

let inGame = false;

const snap = new Audio("snap.mp3");

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.msg === "error") {
    console.log(data);
    $("#error").html(data.error);
  } else if (data.msg === "JoinedRoom") {
    $("#roomChoice").hide();
    $("#colorChoice").show();
  } else if (data.msg === "colors") {
    if (playerColor !== undefined) return;

    $("#colorChoice").empty();

    for (const availableColor of data.colors) {
      $("#colorChoice").append(`<button onclick="colorChoice(${availableColor})">${names[availableColor]}</button>`)
    }
  } else if (data.msg === 'setColor') {
    setBoardSpot(data.x, data.y, data.color);
  }
}

function joinRoom() {
  ws.send(JSON.stringify({
    msg: "joinRoom",
    id: $("#room-id").val()
  }))
}

function createRoom() {
  ws.send(JSON.stringify({
    msg: "createRoom",
    id: $("#room-id").val()
  }))
}

const boardElts = [];
const board = [];

let hoverX = null;
let hoverY = null;

/**
 * @type {number}
 */
let playerColor;

function colorChoice(choice) {
  playerColor = choice;
  $("#colorChoice").empty();
  ws.send(JSON.stringify({
    msg: "color",
    color: choice
  }));

  inGame = true;

  for (let i = 0; i < 20; i++) {
    const elts = [];
    const boardSpots = [];

    for (let j = 0; j < 20; j++) {
      const elt = $(`<span class='tile' onclick='onClick(${i}, ${j})' onmouseenter='onHover(${i}, ${j})'></span>`);
      elts.push(elt);
      boardSpots.push(-1);

      elt[0].style.gridColumnStart = j + 1;
      elt[0].style.gridRowStart = i + 1;

      $("#board").append(elt);
    }


    boardElts.push(elts);
    board.push(boardSpots);
  }

  showPolyminos();
}

function setBoardSpot(x, y, color) {
  board[x][y] = color;
  boardElts[x][y][0].style.backgroundColor = colors[color];
  boardElts[x][y][0].style.animation = "tileChanged 0.4s linear";

  snap.play();
  $("#mostRecentColor").html(`Most recent color: ${names[color]}`);

  previewStatusChanged();
}

function rerenderBoard() {
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      if (board[x][y] === -1) {
        boardElts[x][y][0].style.backgroundColor = "#303030";
        continue;
      }

      boardElts[x][y][0].style.backgroundColor = colors[board[x][y]];
    }
  }
}

function onClick(clickX, clickY) {
  if (!isValidPosition(clickX, clickY)) return;

  firstMove = false;

  const polymino = polyminos[selectedPolymino];

  availablePolyminos[selectedPolymino] = false;

  const size = Math.sqrt(polymino.length);

  const cornerX = clickX - Math.floor(size / 2);
  const cornerY = clickY - Math.floor(size / 2);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = cornerX + i;
      const y = cornerY + j;

      if (polymino[i * size + j] === 0) continue;

      ws.send(JSON.stringify({
        msg: "setColor",
        x,
        y,
        color: playerColor
      }));
    }
  }

  selectedPolymino = availablePolyminos.indexOf(true);
  showPolyminos();
}

function onHover(x, y) {
  hoverX = x;
  hoverY = y;
  previewStatusChanged();
}

function previewStatusChanged() {
  if (hoverX === null || hoverY === null) return;

  rerenderBoard();
  const valid = isValidPosition(hoverX, hoverY);

  if (selectedPolymino === -1) return;

  const polymino = polyminos[selectedPolymino];
  const size = Math.sqrt(polymino.length);

  const cornerX = hoverX - Math.floor(size / 2);
  const cornerY = hoverY - Math.floor(size / 2);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = cornerX + i;
      const y = cornerY + j;

      if (outsideBoard(x, y) || board[x][y] != -1 || polymino[i * size + j] === 0) continue;

      boardElts[x][y][0].style.backgroundColor = valid ? colors[4] : colors[5];
    }
  }
}