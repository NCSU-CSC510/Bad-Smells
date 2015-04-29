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
		var issueT = new LINQ(issues[issue]);
		
		var assignee = issueT.Where(function(x) { return x.event === "assigned"});
		
		console.log("%d|%s", issue, assignee.items.length > 0);
	}
	
	console.log("");
}