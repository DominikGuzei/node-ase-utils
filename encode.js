var ByteBuffer = require('bytebuffer');
var constants = require('./constants');

function encode(data) {

  var colors = data.colors,
      numberOfSwatches = data.colors.length,
      //numberOfSwatches = 2,
	    ase = new ByteBuffer();

	ase.writeUTF8String(constants.FILE_SIGNATURE);
	ase.writeInt(constants.FORMAT_VERSION);
	ase.writeInt(numberOfSwatches); // number of blocks

  for (var i = 0; i < numberOfSwatches; i++) {

    var color = colors[i],
        swatch = new ByteBuffer(),
        j=null;

    // block type
    // (0xc001 ⇒ Group start, 0xc002 ⇒ Group end, 0x0001 ⇒ Color entry)
    ase.writeShort(constants.COLOR_START);

    // Group/Color name
    // 0-terminated string of length (uint16) double-byte characters
    swatch.writeShort(color.name.length + 1);
    for(j=0; j < color.name.length; j++) {
      swatch.writeShort(color.name.charCodeAt(j));
    }
    swatch.writeShort(0); // terminate with 0

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

  ase.flip();
	return ase.toBuffer();
}

module.exports = encode;
