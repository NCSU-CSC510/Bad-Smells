var LINQ = require('node-linq').LINQ;
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

console.log(projectObj);

