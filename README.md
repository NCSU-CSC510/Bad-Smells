# Project 2 Report - Quest for Bad Smells
###Projects we took for analysis :
1. CMS-module
2. MarkParser
3. Tarantula-python

##Data Collection

1. How data was collected

  First, a dump of the git data was colected using the git API for nodejs. This data acted as the base database .
  Data for each project being analysed is stored in a seperate [Project-name].json file.

  Code snippet used to query this data is as below:
  ```nodejs
  return new Promise(function(resolve, reject) {
		request({
			url: "https://api.github.com/repos/[Project-name]]/issues/events?page=" + num,
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
  ```

  The data is stored in JSON format .
  For each of the bad smell detector created, the nodejs package LINQ is used to query the base database.

2. Issue Data Collection

    For this category of bad smells detector,  the scripts [issues-skipped.js](Bad Smells/issues-skipped.js) and [issues-assigned.js](Bad Smells/issues-assigned.js).

    The data is grouped by issues for each project and analysis is performed.

    ```nodejs
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
    ```
3. Label Data Collection

  For this category of bad smells detector,the scripts [label-distributin.js](Bad Smells/label-distributon.js) and [label-time.js](Bad Smells/label-time.js) are used

  The data is grouped by labels for each project and analysis is performed.

  ```nodejs
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
  ```

4. Commit Data Collection

  For this category of bad smells detector,the scripts [commits.js](Scraper/commits.js) is used

  ```nodejs
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

  ```

  The data is grouped by commits for each project and analysis is performed.

5. Milestone Data Collection

  For this category of bad smells detector,the script [milestone-issues.js](Bad Smells/milestone-issues.js) is used

  ```nodejs
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
  ```


##Anonymization
To anonymize the data, we numbered each project as P1, P2 and P3 and also numbered the users in a project as user1, user2, user3 etc. Withing each project to analyze the various labels, we have named the labels as L1,L2,L3 etc.

##Tables
After the data collection phase, we have stored the data in a excel spreadsheet. The data for each project was anonymized based on the above mentioned scheme. Also, the data was separated based on the features as presented below. After categorizing the data into different features, we calculated the mean and the statndard deviation for each project per feature. The data was analyzed and all the values which differ the mean by 1.5 times the standard deviation were marked. After analyzing the data, we have plotted graphs for each feature.

##Data
|S.No|Feature|Project1|Project2|Project3|
|------|-------|--------------|--------------|--------------|
|1|Commit Distribution|0|0|0|
|2|No passenger|0|0|0|
|3|No great dictator|0|0|0|
|4|Assignment of issues|0|0|0|
|5|Issues skipped|0|0|0|
|6|Overused label|0|0|0|
|7|Milestones overdue|0|0|0|
|8|Too much time spent on a label|-|-|-|
|9|Very less times spent on a label|0|0|0|
|10|Milestones with fewer issues|0|0|0|
|11|Milestone with too many issues|0|0|0|

##Data Samples
**1. Commit Distribution**

**2. No passenger**

**3. No great dictator**

**4. Assignment of issues**

**5. Issues skipped**

**6. Label distribution**

**7. Milestones overdue**

**8. Too much time spent on a label**

**9. Very less times spent on a label**

**10. Milestones with fewer issues**

**11. Milestone with too many issues**

##Feature Detection and Results
**1. Commit Distribution**
In this feature we analyzed the commit data for each project on a week basis. The idea was to determine the commit ditribution over the project timelines.

***Results :***

**2. No passenger**
The idea behind this feature was to analyze the commit percentage of each user so that there are no passengers who have very less number of commits 

***Results :***

**3. No great dictator**
The idea behind this feature was to determine the commit distribution of each user so that there are no great dictators(one person with most of the commits).

***Results :***

**4. Assignment of issues**
In this feature we wanted to check how many issues are assigned and how many issues are closed without any assignee.

***Results :***

**5. Issues skipped**
In this feature we wanted to check the expected completion time and the actual completion time of each issue.

***Results :***

**6. Label distribution**
In this feature we wanted to analyze the number of issues per label so as to determine if any label is overused or unused.

***Results :***

**7. Milestones overdue**
In this feature we have analzed expected closing time and the actual closing time for each milestone.

***Results :***

**8. Too much time spent on a label**
In this feature we have analyzed the time spent by each issues in differen labels so as to determine there were no labels on which most of the issues spent most of the time.

***Results :***

**9. Very less times spent on a label**
In this feature we have analyzed the time spent by each issue in different labels so as to determine that there were no labels on which most of the isssue spent very less time.

***Results :***

**10. Milestones with fewer issues**
In this feature we have analyzed the number of issues per milestone so as to determine that there are no milestone with zero or very few issues.

***Results :***

**11. Milestone with too many issues**
In this feature we have analyzed the number of issues per milestone so as to determine the milestone which had most of the issues attached with them

***Results :***

##Bad Smells Detector and Results
**1. Commit Distribution**

***Results :***

**2. No passenger**

***Results :***

**3. No great dictator**

***Results :***

**4. Assignment of issues**

***Results :***

**5. Issues skipped**

***Results :***

**6. Label**

***Results :***

**7. Milestones overdue**

***Results :***

**8. Too much time spent on a label**

***Results :***

**9. Very less times spent on a label**

***Results :***

**10. Milestones with fewer issues**

***Results :***

**11. Milestone with too many issues**

***Results :***

##Early Warning

##Early Warning Results



