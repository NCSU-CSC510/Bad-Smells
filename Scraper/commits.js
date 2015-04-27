var LINQ = require('node-linq').LINQ;
var Stats = require('fast-stats').Stats;
var fs = require("fs");

var upperThreshold = 60;
var lowerThreshold = 10;

var commitsArr = [];
var userNum = 1;
var projectNum = 1;

var commits = JSON.parse(fs.readFileSync("../CMS-module-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);
var commits = JSON.parse(fs.readFileSync("../MarkParser-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);
var commits = JSON.parse(fs.readFileSync("../tarantula-python-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);
var projectObj = {};

for(var i = 0; i < commitsArr.length; i++) {
	var commits = commitsArr[i];
	var commitPerc = {};
	userNum = 1;

	var totalCommits = 0;

	commits.map(function(x) {
		for(var i = 0; i < x.weeks.length; i++) {
			totalCommits += x.weeks[i].c;
		}
	})

	commits.map(function(x) {
		var userCommits = 0;
		for(var i = 0; i < x.weeks.length; i++)
			userCommits += x.weeks[i].c;
		
		var commitPercent = parseFloat((userCommits / totalCommits) * 100);
		commitPerc["User"+userNum++] = {
			perc: commitPercent.toFixed(2),
			badUp: commitPercent > upperThreshold,
			badDown: commitPercent < lowerThreshold
		};
	});

	projectObj["P" + projectNum++] = commitPerc;
}

console.log("Commit Distribution Bad Smell")
console.log(projectObj);

projectNum = 1;
for(var i = 0; i < commitsArr.length; i++) {
	var commits = new LINQ(commitsArr[i]);
	var obj = {};
	var valuesArr = [];
	
	var result = commits.Select(function(x) {return x.weeks}).Map(function(x) {
		for(var j = 0; j < x.length; j++) {
			if(!obj[x[j].w])
				obj[x[j].w] = 0;
			obj[x[j].w] += x[j].c;
		}
	})
	
	var weekNum = 1;
	var obj2 = {};
	for(var a in obj) {
		obj2["Week " + weekNum++] = obj[a];
		valuesArr.push(obj[a]);
	}
	var s = new Stats().push(valuesArr);
	projectObj["P" + projectNum] = {
		dist: obj2,
		mean: parseFloat(s.amean().toFixed(2)),
		stddev: parseFloat(s.stddev().toFixed(2))
	}
	
	var project = projectObj["P" + projectNum];
	project.distBad = [];
	weekNum = 1;
	for(var j in project.dist) {
		var num = projectObj["P" + projectNum].dist[j];
		project.distBad["Week " + weekNum++] = num > (project.mean + project.stddev) || num < (project.mean - project.stddev);
	}
	
	projectNum++;
}

console.log("Commit Weekly Distribution");
console.log(projectObj);
