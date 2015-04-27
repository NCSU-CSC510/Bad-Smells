var LINQ = require('node-linq').LINQ;
var fs = require("fs");

var commits = JSON.parse(fs.readFileSync("../CMS-module-commits.json", {encoding: "utf8"}));
var commitPerc = {};

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
	commitPerc[x.author.login] = (userCommits / totalCommits) * 100;
});

console.log(commitPerc);