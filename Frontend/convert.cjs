const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(path.join(__dirname, 'src'), (err, files) => {
  if (err) throw err;
  files.forEach((file) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const isTsx = file.endsWith('.tsx');
      const newFile = isTsx ? file.replace(/\.tsx$/, '.jsx') : file.replace(/\.ts$/, '.js');
      
      const code = fs.readFileSync(file, 'utf-8');
      
      // Transform with Babel to strip types
      babel.transformAsync(code, {
        filename: file,
        presets: [
          ['@babel/preset-typescript', { isTSX: isTsx, allExtensions: true }],
          // Not using preset-react because we want to keep JSX intact for Vite
        ],
        retainLines: true,
        plugins: [
            '@babel/plugin-syntax-jsx'
        ]
      }).then(result => {
        fs.writeFileSync(newFile, result.code);
        fs.unlinkSync(file); // delete old .ts/.tsx file
        console.log(`Converted ${path.basename(file)} to ${path.basename(newFile)}`);
      }).catch(e => {
        console.error("Failed to transpile", file);
        console.error(e);
      });
    }
  });
});
