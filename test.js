var test = require('tape');
var ase = require('./');
var fs = require('fs');

test('decode', function(test) {
  var buffer = fs.readFileSync('./test.ase');
  var output = require('./test.json');
  test.deepEqual(simplify(ase.decode(buffer)), simplify(output));
  test.end();
});

test('encode', function(test) {
  var buffer = fs.readFileSync('./test.ase');
  var input = require('./test.json');
  test.deepEqual(ase.encode(input), buffer);
  test.end();
});

function simplify(data) {
  data.colors.forEach(function(c) {
    c.color = c.color.map(function(n) {
      return Math.round(n * 1000) / 1000;
    });
  });

  return data;
}
