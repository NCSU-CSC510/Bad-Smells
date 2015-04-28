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
	var issuesArr = [];

	issues = issues.GroupBy(function(x) {return x.issue.number});
	
	for(var issue in issues) {
		var issueLINQ = new LINQ(issues[issue]);
		
		labelled = issueLINQ.Where(function(x) {return x.event === "labeled"}).Select(function(x){ return {"labeled_at": x.created_at, "name": x.label.name}});
		
		closed = issueLINQ.Where(function(x) {return x.event === "closed"}).Select(function(x) {return x.created_at});
		var labelsArr = [];
		
		for(var j = 0; j < labelled.items.length; j++) {
			var label = labelled.items[j];
			
			var unlabeled = issueLINQ.Where(function(x) {return x.event === "unlabeled" && x.label.name === label.name && (new Date(x.created_at) > new Date( label.labeled_at))}).Select(function(x) {return x.created_at});
			
			if(unlabeled.items.length > 0) {
				label.unlabeled_at = unlabeled.items[0];
				
				var diff = new Date(label.unlabeled_at) - new Date(label.labeled_at);
				label.diff =diff/3600000;
				
				labelsArr.push(label);
			}
		}
		
		issuesArr.push({
			"number": issue,
			"labels": labelsArr
		});
		
//		console.log(labelled);
//		console.log(closed);
	}
	
	var s = new Stats();
	var mean, stddev ;
	
	for(var k = 0; k < issuesArr.length; k++) {
		var labelsArr = issuesArr[k].labels;
		for(var j = 0; j < labelsArr.length; j++) {
			s.push(labelsArr[j].diff);
		}
	}
	mean = s.amean();
	stddev = s.stddev();
	
	console.log("Mean: %d Standard Deviation: %d", s.amean().toFixed(2), s.stddev().toFixed(2));
	
	for(var k = 0; k < issuesArr.length; k++) {
		var labelsArr = issuesArr[k].labels;
		if(labelsArr.length > 0)
			console.log(issuesArr[k].number);
		for(var j = 0; j < labelsArr.length; j++) {
			labelsArr[j].badUp = false;
			labelsArr[j].badDown = false;
			if(labelsArr[j].diff > mean + stddev)
				labelsArr[j].badUp = true;
			if(labelsArr[j].diff < mean - stddev)
				labelsArr[j].badDown = true;
			
			console.log("%s|%d|%s|%s", labelsArr[j].name, labelsArr[j].diff.toFixed(2), labelsArr[j].badUp, labelsArr[j].badDown);
		}
	}
	
	console.log("");
}