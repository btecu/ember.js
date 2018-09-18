const fs = require('fs');
const validate = require('sourcemap-validator');

QUnit.module('sourcemap validation', function() {
  let assets = ['ember.debug', 'ember.prod', 'ember.min'];

  assets.forEach(asset => {
    QUnit.test(`${asset} has only a single sourcemaps comment`, function(assert) {
      let jsPath = `dist/${asset}.js`;
      assert.ok(fs.existsSync(jsPath));

      let contents = fs.readFileSync(jsPath, 'utf-8');
      let num = count(contents, '//# sourceMappingURL=');
      assert.equal(num, 1);
    });
  });
});

function count(source, find) {
  let num = 0;

  let i = -1;
  while ((i = source.indexOf(find, i + 1)) !== -1) {
    num += 1;
  }

  return num;
}

QUnit.module('sourcemap content validation', function() {
  let assets = ['ember.debug', 'ember.prod', 'ember.min'];

  assets.forEach(asset => {
    QUnit.test(`${asset} has valid sourcemaps`, function(assert) {
      assert.expect(0);

      let jsPath = `dist/${asset}.js`;

      if (fs.existsSync(jsPath)) {
        let contents = fs.readFileSync(jsPath, 'utf-8');
        let sourcemap = fs.readFileSync(`dist/${asset}.map`, 'utf-8');

        validate(contents, sourcemap);
      }
    });
  });
});
