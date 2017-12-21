
var ctx;
var board;
var playerId;

class Board {
  constructor(data) {
    this.players = [];
    console.log(data);
    this.player = new Player(data);
    this.food = [];
  }

  render() {
    for (var i = 0; i < this.food.length; i++) {
      this.players[i].render();
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].render();
    }
    this.player.render();
  }

  genUpdateData() { // return hash for server
    return this.player.genUpdateData()
  }

  handleUpdate(data) {
    console.log(data);
  }

  sendUpdate() {
    $.post("update", JSON.stringify(board.genUpdateData()),
    function(data, status) {
      if (status == "success") {
        board.handleUpdate(data);
      } else {
        alert("Server Error: " + status)
      }
    });
  }
}

class Food {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  render() {
    ctx.fillRect(this.x, this.y, 10, 10);
  }

}

class Player {
  constructor (data) {
    this.id = data["id"];
    this.x = data["x"];
    this.y = data["y"];
    this.size = 10;
    this.facing = 0; // up; won't be used until later updates
  }

  render() {
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.x += (mouseX - $(window).width() / 2) / 20;
    this.y += (mouseY - $(window).height() / 2) / 20;
  }

  genUpdateData() {
    return {"id": this.id, "x": this.x, "y": this.y, "facing": this.facing}
  }
}

class OtherPlayer {
  constructor (data) {
    this.x = data["x"];
    this.y = data["y"];
    this.size = data["size"];
    this.facing = data["facing"];
  }

  render() {
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {

  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var loop = function() {
  $("#canvas").attr("width", $(window).width());
  $("#canvas").attr("height", $(window).height());
  board.render();
  board.sendUpdate();
}

$(document).ready(function() {
  ctx = document.getElementById("canvas").getContext("2d");
  $.get("new_player", 
  function(data, status){
    if (status == "success") {
      data = JSON.parse(data);
      board = new Board(data);
      playerId = data["id"];
      setInterval(loop, 20);
    } else {
      alert("Server Error: " + status);
    }
  });
});