var request = require("request");
var PCQueue = require("promise-pc").PCQueue;
var Promise = require("promise");
var fs = require("fs");

var issuesQueue = new PCQueue({maxParallel: 10, tree: true});
var pageNum = 1;

var issuesArr = [];

var headers = {
	Host: "api.github.com",
	Connection: "keep-alive",
	Pragma: "no-cache",
	"Cache-Control": "no-cache",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36",
	"Accept-Encoding": "gzip, deflate, sdch",
	"Accept-Language": "en-US,en;q=0.8",
	Cookie: "_octo=GH1.1.594705564.1422743966; __ssid=48411ad9-7338-4768-8ad1-8daa0935877b; logged_in=yes; dotcom_user=anlawande; _ga=GA1.2.130688933.1422743965"
}

issuesQueue.treeNodes = 0;

function createRequest() {
	console.log(pageNum);
	issuesQueue.children(1);
	issuesQueue.produce(function() {
		return createRequestP(pageNum++);
	}).done(function(num) {
		if(num > 0)
			createRequest();
	});
}

createRequest();

function createRequestP (num) {
	return new Promise(function(resolve, reject) {
		request({
			url: "https://api.github.com/repos/bighero4/MarkParser/issues/events?page=" + num,
			headers: headers,
			gzip: true
		}, function(err, resp, body) {
			if(err) {
				console.log(err);
				reject();
				return;
			}
			var arr = JSON.parse(body);
			issuesArr = issuesArr.concat(arr);
			resolve(arr.length);
			//console.log(body);
		})
	});
}

issuesQueue.treeNotify(function() {
	issuesArr = issuesArr.reverse();
	fs.writeFileSync("./issues.json", JSON.stringify(issuesArr), {encoding: 'utf8'});
})
	