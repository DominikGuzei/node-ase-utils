module.exports = {
  FILE_SIGNATURE: "ASEF",
  FORMAT_VERSION: 0x10000,

  COLOR_START: 0x0001,
  GROUP_START: 0xc001,
  GROUP_END  : 0xc002,

  MODE_COLOR : 1,
  MODE_GROUP : 2,

  STATE_GET_MODE   : 1,
  STATE_GET_LENGTH : 2,
  STATE_GET_NAME   : 3,
  STATE_GET_MODEL  : 4,
  STATE_GET_COLOR  : 5,
  STATE_GET_TYPE   : 6,

  COLOR_SIZES: {
    CMYK: 4,
    RGB: 3,
    LAB: 3,
    GRAY: 1
  },

  READ_COLOR_TYPES: {
    0: 'global',
    1: 'spot',
    2: 'normal'
  },

  WRITE_COLOR_TYPES: {
    global: 0,
    spot: 1,
    normal: 2
  }
};
