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

var commitsArr = [];

var commits = JSON.parse(fs.readFileSync("../CMS-module-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);
var commits = JSON.parse(fs.readFileSync("../tarantula-python-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);
var commits = JSON.parse(fs.readFileSync("../MarkParser-commits.json", {encoding: "utf8"}));
commitsArr.push(commits);

for(var i = 0; i < commitsArr.length; i++) {
	console.log("P" + (i+1));
	var commits = commitsArr[i];
	var weekArr = [];

	for(var j = 0; j < commits.length; j++) {
		var login = commits[j].author.login;
		var weeks = commits[j].weeks;

		for(var k = 0; k < weeks.length; k++) {
			var week = weeks[k].w;
			var issues = new LINQ(projectArr[i].issues);

			issues = issues.Where(function(x) {
				var weekBetween = new Date(x.issue.created_at) < new Date(week*1000) && new Date(x.issue.closed_at) > new Date(week*1000);
				return x.issue.assignee && x.issue.assignee.login === login && weekBetween;
			}).GroupBy(function(x) {return x.issue.number});
			var issueCnt = 0;
			for(var issue in issues) {
				issueCnt++;
			}
			
			for(var g = 0; g < weekArr.length; g++)
				if(weekArr[g].week === week)
					break;
			
			if(g === weekArr.length)
				weekArr[g] = [];
			
			weekArr[g].push({
				"login": login,
				"issueCnt": issueCnt
			});
			
			weekArr[g].week = week;
			//console.log("%s|%d", new Date(week*1000), issueCnt);
		}
	}
	
	for(var week = 0; week < weekArr.length; week++) {
		var s = new Stats();
		var mean;
		
		if(week === 0)
			mean = 0;
		else {
			for(var j = 0; j < weekArr[week-1].length; j++) {
				s.push(weekArr[week-1][j].issueCnt);
			} 
			mean = s.amean();
		}
		
		console.log("")
		console.log("Week " + (week + 1));
		console.log("%s|%d","Mean", mean);
		for(var j = 0; j < weekArr[week].length; j++) {
			console.log("%s|%d|%s", weekArr[week][j].login, weekArr[week][j].issueCnt, weekArr[week][j].issueCnt < mean - 2 || weekArr[week][j].issueCnt > mean + 2);
		}
	}

	console.log("");
}