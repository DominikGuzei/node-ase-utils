var assert = require('assert');
var constants = require('./constants');

var errors = {
  header: 'Not a valid .ASE file',
  unexpected: 'Unexpected state. This is a bug!'
};

function decode(buffer) {
  if (typeof buffer === 'string') {
    buffer = Buffer(buffer);
  }

  var output = {};
  var groups = output.groups = [];
  var colors = output.colors = [];

  assert(getChar8(0) === 'A', errors.header);
  assert(getChar8(1) === 'S', errors.header);
  assert(getChar8(2) === 'E', errors.header);
  assert(getChar8(3) === 'F', errors.header);

  output.version = [
    buffer.readUInt16BE(4),
    buffer.readUInt16BE(6)
  ].join('.');

  var blocks = buffer.readUInt32BE(8);
  var state = constants.STATE_GET_MODE;
  var mode = constants.MODE_COLOR;
  var position = 12;
  var blockLength;
  var block;
  var group;
  var color;

  x: while (position < buffer.length) {
    switch (state) {
      case constants.STATE_GET_MODE:   readBlockMode();   continue x;
      case constants.STATE_GET_LENGTH: readBlockLength(); continue x;
      case constants.STATE_GET_NAME:   readBlockName();   continue x;
      case constants.STATE_GET_MODEL:  readBlockModel();  continue x;
      case constants.STATE_GET_COLOR:  readBlockColor();  continue x;
      case constants.STATE_GET_TYPE:   readBlockType();   continue x;
    }
    throw new Error(errors.unexpected);
  }

  return output;

  function readBlockMode() {
    switch (buffer.readUInt16BE(position)) {
      case constants.COLOR_START:
        colors.push(block = color = {});
        mode = constants.MODE_COLOR;
        break;
      case constants.GROUP_START:
        groups.push(block = group = { colors: [] });
        mode = constants.MODE_GROUP;
        break;
      case constants.GROUP_END:
        group = null;
        break;

      default:
        throw new Error('Unexpected block type at byte #' + position);
    }

    if (group && block === color) {
      group.colors.push(color);
    }

    position += 2;
    state = constants.STATE_GET_LENGTH;
  }

  function readBlockLength() {
    //doesn't appear to be reading the block length correctly
    //does on the first block, but then fails on the second.
    blockLength = buffer.readUInt32BE(position);
    position += 4;
    state = constants.STATE_GET_NAME;
  }

  function readBlockName() {
    var length = buffer.readUInt16BE(position);
    var name = '';
    while (--length) {
      name += getChar16(position += 2);
    }
    position += 4;
    block.name = name;
    if(mode === constants.MODE_GROUP) {
      state = constants.STATE_GET_MODE;
    }
    else {
      state = constants.STATE_GET_MODEL;
    }
  }

  function readBlockModel() {
    block.model = (
      getChar8(position++) +
      getChar8(position++) +
      getChar8(position++) +
      getChar8(position++)
    ).trim();
    state = constants.STATE_GET_COLOR;
  }

  function readBlockColor() {
    var model = block.model.toUpperCase();
    var count = constants.COLOR_SIZES[model];
    var channels = [];

    while (count--) {
      channels.push(buffer.readFloatBE(position));
      position += 4;
    }

    block.color = channels;
    state = constants.STATE_GET_TYPE;
  }

  function readBlockType() {
    block.type = constants.READ_COLOR_TYPES[buffer.readUInt16BE(position)];
    position += 2;
    state = constants.STATE_GET_MODE;
  }

  function getChar8(index) {
    return String.fromCharCode(buffer.readUInt8(index));
  }

  function getChar16(index) {
    return String.fromCharCode(buffer.readUInt16BE(index));
  }
}

module.exports = decode;
