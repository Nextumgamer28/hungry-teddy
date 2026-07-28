const { JSDOM } = require('jsdom');
JSDOM.fromURL("http://localhost:8080/", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  dom.window.console = console;
  setTimeout(() => {
    console.log("Done waiting");
    process.exit(0);
  }, 2000);
});
