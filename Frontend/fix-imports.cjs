const fs = require('fs');
const path = require('path');

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
    if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const code = fs.readFileSync(file, 'utf-8');
      
      // Replace explicit .tsx or .ts imports with .jsx and .js
      const newCode = code.replace(/from\s+['"](.+?)\.tsx['"]/g, 'from "$1.jsx"')
                          .replace(/from\s+['"](.+?)\.ts['"]/g, 'from "$1.js"')
                          .replace(/import\s+['"](.+?)\.tsx['"]/g, 'import "$1.jsx"')
                          .replace(/import\s+['"](.+?)\.ts['"]/g, 'import "$1.js"');
                          
      if (code !== newCode) {
         fs.writeFileSync(file, newCode);
         console.log(`Updated imports in ${path.basename(file)}`);
      }
    }
  });
});
