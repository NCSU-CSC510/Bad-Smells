var LINQ = require('node-linq').LINQ;
var Stats = require('fast-stats').Stats;
var fs = require("fs");

var projectArr = [];
var projectNum = 1;

var issues = JSON.parse(fs.readFileSync("../Scraper/CMS-module.json", {encoding: "utf8"}));
projectArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})
var issues = JSON.parse(fs.readFileSync("../Scraper/Tarantula.json", {encoding: "utf8"}));
projectArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})
var issues = JSON.parse(fs.readFileSync("../Scraper/MarkParser.json", {encoding: "utf8"}));
projectArr.push({
	"project": "P" + projectNum++,
	"issues": issues
})


for(var i = 0; i < projectArr.length; i++) {
	console.log(projectArr[i].project);
	var issues = new LINQ(projectArr[i].issues);
	var s = new Stats();
	var mean, stddev;
	
	var milestones = issues.Select(function(x) {return x.issue.milestone}).Where(function(x) {return x !== null}).GroupBy(function(x) { if(x) return x.number});

	for (var mile in milestones) {
		var milestone = milestones[mile][0];
		s.push(milestone.open_issues + milestone.closed_issues);
	}
	
	mean = s.amean();
	stddev = s.stddev();

	console.log("Mean: " + mean.toFixed(2) + " Standard Deviation: " + stddev.toFixed(2));

	for (var mile in milestones) {
		var milestone = milestones[mile][0];
		var over = milestone.open_issues + milestone.closed_issues > mean + stddev;
		var under = milestone.open_issues + milestone.closed_issues < mean - stddev;
		console.log("Milestone %d|%d|%s|%s", mile, milestone.open_issues + milestone.closed_issues, over, under);
	}

	console.log("");
}