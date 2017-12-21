#! /usr/bin/ruby

require "webrick"
require "securerandom"
require "json"
require "set"

root = File.expand_path './client'
server = WEBrick::HTTPServer.new :Port => 8000, :DocumentRoot => root

def dist(x1, y1, x2, y2)
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
end

class Board

  def initialize
    @food = Set.new
    @players = { }
    @last_food_spawn = Time.new
  end

  # adds new player to list of players; returns JSON string for client
  def new_player
    new_player = Player.new 0, 0
    id = SecureRandom.uuid;
    @players[id] = new_player
    {"id" => id, "x" => new_player.x, "y" => new_player.y}.to_json
  end

  def player_update(data)
    id = data["id"]
    new_x = data["x"]
    new_y = data["x"]
    new_facing = data["facing"]

    return_data = { }

    player = @players[id]
    puts @players
    x = player.x
    y = player.y
    if (dist(x, y, new_x, new_y) > 5)
      player.facing = new_facing
      return_data["player"] = player.to_json
    else
      player.x      = new_x
      player.y      = new_y
      player.facing = new_facing
      return_data["player"] = player.to_json
    end

    return_data["food"] = food_json
    return_data["other_players"] = players_json(id)

    return_data.to_json
  end

  def food_json
    return @food.to_a.to_json
  end

  def players_json(id)
    return_arr = []
    @players.each do |player_id, player|
      return_arr.push player if (id != player_id)
    end
    return_arr.to_json
  end

  def update
    new_players = { }
    @players.each do |id, player|
      if player.update
        new_players[id] = player
      end
    end
    @players = new_players
    if Time.new - @last_food_spawn >= 10
      spawn_food
      @last_food_spawn = Time.new
    end
    nil
  end

  def spawn_food
    rand(10).times do
      @food.add Food.new(rand(100), rand(100), 0)
    end
  end

end

class Player

  attr_accessor :x, :y, :facing

  def initialize(x, y)
    @x = x
    @y = y
    @facing = 0;
    @last_update = Time.new
  end

  def update # return false if needs to be destroyed
    return false if Time.new - @last_update > 60
    @last_update = Time.new
    true
  end

  def to_json(arg = nil)
    {"x" => @x,
     "y" => @y,
     "facing" => @facing}.to_json
  end

end

class Food

  attr_reader :x, :y, :type

  def initialize(x, y, type)
    @x = x
    @y = y
    @type = type
  end

  def to_json(arg = nil)
    {"x" => @x,
     "y" => @y,
     "type" => @type}.to_json
  end
end

board = Board.new

server.mount_proc '/new_player' do |req, res|
  res.body = board.new_player
end

server.mount_proc '/update' do |req, res|
  board.update
  res.body = board.player_update JSON.parse(req.body)
end

trap 'INT' do
  server.shutdown
end

server.start