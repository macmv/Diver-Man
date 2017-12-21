
var ctx;
var board;
var playerId;
var mouseX = 0;
var mouseY = 0;

class Board {
  constructor(data) {
    this.other_players = [];
    this.player = new Player(data);
    this.food = [];
  }

  render() {
    for (var i = 0; i < this.food.length; i++) {
      this.food[i].render();
    }
    for (i = 0; i < this.other_players.length; i++) {
      this.other_players[i].render();
    }
    this.player.render();
  }

  update() {
    this.player.update();
    this.sendUpdate();
  }

  genUpdateData() { // return hash for server
    return this.player.genUpdateData()
  }

  handleUpdate(data) {
    data = JSON.parse(data);
    this.food = [];
    console.log
    for(var f in data.food) {
      this.food.push(new Food(data.food[f]));
    }
    this.other_players = [];
    for(var i in data.other_players) {
      this.other_players.push(new OtherPlayer(data.other_players[i]));
    }
    console.log(this.other_players);
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
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    this.type = data.type;
  }

  render() {
    ctx.fillRect(this.x, this.y, 10, 10);
  }

}

class Player {
  constructor (data) {
    this.id = data["id"];
    this.x = 0;
    this.y = data["y"];
    this.size = 10;
    this.facing = 0; // up; won't be used until later updates
  }

  render() {
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.x += (mouseX - $(window).width() / 2) / 200;
    this.y += (mouseY - $(window).height() / 2) / 200;
  }

  genUpdateData() {
    return {"id": this.id, "x": this.x, "y": this.y, "facing": this.facing}
  }
}

class OtherPlayer {
  constructor (data) {
    this.x = data.x;
    this.y = data.y;
    this.size = 10;
    this.facing = data.facing;
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
  board.update();
}

$(document).mousemove(function(e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
});

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