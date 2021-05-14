function showPolyminos() {
  $("#polyminos").empty();

  for (let i = 0; i < polyminos.length; i++) {
    if (!availablePolyminos[i]) continue;

    const polymino = polyminos[i];

    const div = $("<div class='flex-column' style='margin: 16px'></div>");
    const rows = Math.sqrt(polymino.length);

    let currentFlex;
    for (let j = 0; j < polymino.length; j++) {
      if (j % rows === 0) {
        div.append(currentFlex);
        currentFlex = $("<div class='flex'></div>");
      }

      const elt = $(`<span class='tile' onclick='changeSelectedPolymino(${i})'></span>`);

      colorTile(elt, polymino[j], i);

      currentFlex.append(elt);
    }

    div.append(currentFlex);

    $("#polyminos").append(div);
  }

  $("#buttons")[0].hidden = false;
}

function colorTile(elt, polyminoValue, i) {
  if (polyminoValue) {
    if (i === selectedPolymino) {
      elt[0].style.backgroundColor = colors[playerColor];
    } else {
      elt[0].style.backgroundColor = colors[4];
    }
  } else {
    elt[0].style.backgroundColor = "#000000";
  }
}

function changeSelectedPolymino(polymino) {
  selectedPolymino = polymino;
  showPolyminos();
  previewStatusChanged();
}