var ByteBuffer = require('bytebuffer');
var constants = require('./constants');

function writeName(buffer, name) {
  buffer.writeShort(name.length + 1);
  for(j=0; j < name.length; j++) {
    buffer.writeShort(name.charCodeAt(j));
  }
  buffer.writeShort(0); // terminate with 0
}

function addColor(ase, color) {

  // block type
  // (0xc001 ⇒ Group start, 0xc002 ⇒ Group end, 0x0001 ⇒ Color entry)
  ase.writeShort(constants.COLOR_START);

  var swatch = new ByteBuffer(),
    j = null;

  writeName(swatch, color.name);

  // color model - 4*char (CMYK, RGB, LAB or Gray)
  var model = color.model.length == 4 ? color.model : color.model + " ";
  swatch.writeUTF8String(model);

  // color values
  // CMYK ⇒ 4*float32 / RGB & LAB ⇒ 3*float32 / Gray ⇒ 1*float32
  for(j=0; j < constants.COLOR_SIZES[color.model.toUpperCase()]; j++) {
    swatch.writeFloat(color.color[j]);
  }

  // color type - 1*int16 (0 ⇒ Global, 1 ⇒ Spot, 2 ⇒ Normal)
  swatch.writeShort(constants.WRITE_COLOR_TYPES[color.type]);

  // block length - 1*int32
  ase.writeInt(swatch.offset);

  // add to ase buffer
  swatch.flip();
  ase.append(swatch);
}

function addGroup(ase, group) {

  ase.writeShort(constants.GROUP_START);

  var groupBuffer = new ByteBuffer(),
    k = null;

  writeName(groupBuffer, group.name);

  // block length - 1*int32
  ase.writeInt(groupBuffer.offset);

  // add to ase buffer
  groupBuffer.flip();
  ase.append(groupBuffer);
}

function addGroupEnd(ase, group) {

  ase.writeShort(constants.GROUP_END);

  var groupBuffer = new ByteBuffer(),
    k = null;

  groupBuffer.writeShort(0);
  groupBuffer.writeShort(0); // terminate with 0

  // add to ase buffer
  groupBuffer.flip();
  ase.append(groupBuffer);
}

function encode(data) {

  var colors = data.colors,
      groups = data.groups,
      colorBlocks = colors.length,
      groupColorBlocks = groups.reduce((a, b) => a + b.colors.length, 0),
      groupBlocks = groups.length * 2,
      blocks = colorBlocks + groupColorBlocks + groupBlocks,
      ase = new ByteBuffer();

	ase.writeUTF8String(constants.FILE_SIGNATURE);
	ase.writeInt(constants.FORMAT_VERSION);
	ase.writeInt(blocks); // number of blocks

  for (var i = 0; i < colors.length; i++) {
    var color = colors[i];
    addColor(ase, color);
	}

  for (var j = 0; j < groups.length; j++) {
    var group = groups[j];
    addGroup(ase, group);
    for (var k = 0; k < group.colors.length; k++) {
      var color = group.colors[k];
      addColor(ase, color);
    }
    addGroupEnd(ase, group);
  }

  ase.flip();
	return ase.toBuffer();
}

module.exports = encode;
