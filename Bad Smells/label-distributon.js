var LINQ = require('node-linq').LINQ;
var Stats = require('fast-stats').Stats;
var fs = require("fs");

var issuesArr = [];
var projectNum = 1;

var issues = JSON.parse(fs.readFileSync("../Scraper/Tarantula.json", {encoding: "utf8"}));
issuesArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})
var issues = JSON.parse(fs.readFileSync("../Scraper/MarkParser.json", {encoding: "utf8"}));
issuesArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})
var issues = JSON.parse(fs.readFileSync("../Scraper/CMS-module.json", {encoding: "utf8"}));
issuesArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})

for(var i = 0; i < issuesArr.length; i++) {
	console.log(issuesArr[i].project);
	var issues = new LINQ(issuesArr[i].issues);
	
	issues = issues.Where(function(x) {return x.event === "labeled"}).GroupBy(function(x) {return x.label.name});
	
	var s = new Stats();
	var mean, stddev;
	
	for (var a in issues) {
		s.push(issues[a].length);
	}
	
	mean = s.amean();
	stddev = s.stddev();
	console.log("Mean: " + mean.toFixed(2) + " Standard Deviation: " + stddev.toFixed(2));
	
	for (var a in issues) {
		var bad = issues[a].length > mean + 1.5*stddev || issues[a].length < mean - 1.5*stddev;
		console.log("%s|%d|%s", a, issues[a].length, bad);
	}
	
	console.log("");
}