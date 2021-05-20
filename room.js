class Room {
  constructor() {
    this.players = new Map();
    this.sockets = [];
    this.boardChanges = [];
    this.colors = [0, 1, 2, 3];
    this.availablePieces = [
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    ];
  }
}

module.exports = Room;