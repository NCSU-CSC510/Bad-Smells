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
	
	issues = issues.GroupBy(function(x) {return x.issue.number});
	
	for(var issue in issues) {
		var iss = issues[issue][0];
		
		if(iss.issue.milestone) {
			var skipped = new Date(iss.issue.closed_at) > new Date(iss.issue.milestone.due_on);
			console.log("Issue %d|%s|%s|%s", issue, iss.issue.closed_at, iss.issue.milestone.due_on, skipped);
		}
	}
	
	console.log("");
}