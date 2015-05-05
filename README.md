# ase-utils
Encode/decode color palettes in Adobe's `.ase` format.

Liberally taken and modified from https://github.com/hughsk/adobe-swatch-exchange

Because Meteor.js does not support loading github forks of npm packages.

## Usage ##
npm install ase-utils

### ase.decode(buffer) ###

Returns a JSON object representing the contents of the `.ase` file, for example:

``` json
{
  "version": "1.0",
  "groups": [],
  "colors": [{
    "name": "RGB Red",
    "model": "RGB",
    "color": [1, 0, 0],
    "type": "global"
  }, {
    "name": "RGB Yellow",
    "model": "RGB",
    "color": [1, 1, 0],
    "type": "global"
  }]
}
```

## License ##

MIT. See [LICENSE.md](http://github.com/CodeAdventure/ase-utils/blob/master/LICENSE.md) for details.
