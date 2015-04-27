var LINQ = require('node-linq').LINQ;
var fs = require("fs");

var issues = JSON.parse(fs.readFileSync("./CMS-module.json", {encoding: "utf8"}));

var arr = new LINQ(issues);

var labels = arr.GroupBy(function(x) {return x.issue.title});
fs.writeFileSync("./dump.json", JSON.stringify(labels), {encoding: "utf8"});