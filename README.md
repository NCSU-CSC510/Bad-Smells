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
  ```javascript
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

    ```javascript
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

  ```javascript
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

  ```javascript
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

  ```javascript
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
|1|Commit Distribution|12|12|12|
|2|No passenger|5|5|4|
|3|No great dictator|5|5|4|
|4|Assignment of issues|27|30|60|
|5|Issues skipped|22|22|39|
|6|Label distribution|8|23|14|
|7|Milestones overdue|4|6|5|
|8|Too much time spent on a label|48|15|74|
|9|Very less times spent on a label|48|15|74|
|10|Milestones with fewer issues|4|8|5|
|11|Milestone with too many issues|4|8|5|

##Data Samples
**1. Commit Distribution**

Sample data table :

|S.No|Week|Number of commits|Bad Smell|
|------|-------|--------------|--------|
|1|Week 1|2|False|
|2|Week 2|7|False|


**2. No passenger**

Sample data table :

|S.No|User|Commit percentage|Passenger|
|------|-------|--------------|---------|
|1|User1|19.8|False|
|2|User2|20.79|False|

**3. No great dictator**

Sample data table :

|S.No|User|Commit percentage|Dictator|
|------|-------|--------------|---------|
|1|User1|19.8|False|
|2|User2|20.79|False|

**4. Assignment of issues**

Sample data table :

|S.No|Issue Number|Assignee present|
|------|-------|--------------|---------|
|1|Issue1|False|
|2|Issue2|True|

**5. Issues skipped**

Sample data table :

|S.No|Issue Number|Closed On|Due On|Exceeded|
|------|-------|--------------|--------------|-------|
|1|Issue1|2/25/2015 22:04|3/3/2015 5:00|False|
|2|Issue2|3/15/2015 18:19|3/3/2015 5:00|True|

**6. Label distribution**

Sample data table :

|S.No|Label|Number of issues|Bad smell|
|------|-------|--------------|---------|
|1|L1|14|True|
|2|L2|9|False|

**7. Milestones overdue**

Sample data table :

|S.No|Milestone|Due on|Closed on|Exceeded|
|------|-------|--------------|------------|-------|
|1|Milestone 1||3/15/2015 4:00|3/30/2015 5:39|True|
|2|Milestone 2|3/31/2015 4:00|4/1/2015 5:58|True|


**8. Too much time spent on a label**

Sample data table :

|S.No|Issue Number|Label|Hours spent|Over|
|------|-------|--------------|--------|----------|
|1|Issue1|L1|267.83|False|
|2|Issue3|L3|912.27|True|
|||L4|21.47|False|
|||L5|48.27|False|

**9. Very less times spent on a label**

Sample data table :

|S.No|Issue Number|Label|Hours spent|Under|
|------|-------|--------------|--------|----------|
|1|Issue1|L1|267.83|False|
|2|Issue3|L3|912.27|False|
|||L4|1.47|True|
|||L5|48.27|False|

**10. Milestones with fewer issues**

Sample data table :

|S.No|Milestone|No. of Issues|Under|
|------|-------|--------------|------------|-------|
|1|Milestone 1|1|True|
|2|Milestone 2|6|False|


**11. Milestone with too many issues**

Sample data table :

|S.No|Milestone|No. of Issues|Over|
|------|-------|--------------|------------|-------|
|1|Milestone 1|1|False|
|2|Milestone 2|6|True|

##Feature Detection and Results
**1. Commit Distribution**
In this feature we analyzed the commit data for each project on a week basis. The idea was to determine the commit ditribution over the project timelines.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Commit Distribution](Data/Commit%20Distribution.xlsx)

**2. No passenger**
The idea behind this feature was to analyze the commit percentage of each user so that there are no passengers who have very less number of commits 

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [No Passenger data](Data/Commit%20Percentage_Passenger.xlsx)

**3. No great dictator**
The idea behind this feature was to determine the commit distribution of each user so that there are no great dictators(one person with most of the commits).

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [No dictator Data](Data/Commit%20Percentage_Dictator.xlsx)

**4. Assignment of issues**
In this feature we wanted to check how many issues are assigned and how many issues are closed without any assignee.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Issue Assignment](Data/Issue%20Assignee.xlsx)

**5. Issues skipped**
In this feature we wanted to check the expected completion time and the actual completion time of each issue.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Issue Skipped](Data/Issues%20Skipped.xlsx)

**6. Label distribution**
In this feature we wanted to analyze the number of issues per label so as to determine if any label is overused or unused.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Label Distribution](Data/Label%20Distribution.xlsx)

**7. Milestones overdue**
In this feature we have analzed expected closing time and the actual closing time for each milestone.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Milestone overdue](Data/Milestone%20Skipped.xlsx)

**8. Too much time spent on a label**
In this feature we have analyzed the time spent by each issues in differen labels so as to determine there were no labels on which most of the issues spent most of the time.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Over used label](Data/Label-Unlabeled%20Time_Up.xlsx)

**9. Very less times spent on a label**
In this feature we have analyzed the time spent by each issue in different labels so as to determine that there were no labels on which most of the isssue spent very less time.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Under used label](Data/Label-Unlabeled%20Time_Down.xlsx)

**10. Milestones with fewer issues**
In this feature we have analyzed the number of issues per milestone so as to determine that there are no milestone with zero or very few issues.

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Milestone with less issues](Data/Milestones%20Issues_Under.xlsx)

**11. Milestone with too many issues**
In this feature we have analyzed the number of issues per milestone so as to determine the milestone which had most of the issues attached with them

***Results :***
The following is the link to data collected. There are three different sheets for each project.
* [Milestone with many issues](Data/Milestones%20Issues_Above.xlsx)

##Bad Smells Detector and Results
**1. Commit Distribution**
In this feature we have collected data about number of commits per week. So if the number of commits differ the mean by 1.5 times the standard deviation, we mark it as bad smell.

<br>*Criteria:*

        no_of_commits > mean + 1.5 * standard_deviation 
        OR  no_of_commits < mean + 1.5 * standard_deviation
***Results :***
The results are represented as graphs below:

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/num_of_commits/NumOfCommits_P1.png)
**Mean :** 8.33
**Std deviation :** 11.34

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/num_of_commits/NumOfCommits_P2.png)
**Mean :** 5.00
**Std deviation :** 5.03
	
*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/num_of_commits/NumOfCommits_P3.png)
**Mean :** 8.42
**Std deviation :** 13.84

**2. No passenger**
In this feature we have collected data about number of commits per user. So if the number of commits is less than 10% of the total, then that user is under "no passenger" category.

<br>*Criteria:*

        no_of_commits < 0.1 * total_commits
***Results :***
The results are represented as graphs below:
As all the percentages were more than 10%, there was no bad smell, in this feature.

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P1.png)

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P2.png)

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P3.png)

**3. No great dictator**
In this feature we have collected data about number of commits per user. So if the number of commits is more than 60% of the total, then that user is under "great dictator" category.

<br>*Criteria:*

        no_of_commits > 0.6 * total_commits

***Results :***
The results are represented as graphs below:
As all the percentages were more than 10%, there was no bad smell, in this feature.

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P1.png)

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P2.png)

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/commit_percentage/CommitPercentage_P3.png)

**4. Assignment of issues**
In this feature we have analyed if all the issues are assigned to some user or not. If any issue is not assigned to any user and is closed, then it is a bad smell.

***Results :***
The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_assigned/Issues_assigned_p1.png)

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_assigned/Issues_assigned_p2.png)

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_assigned/Issues_assigned_p3.png)

**5. Issues skipped**
In this feature we have analyzed if the issues were closed before the expected time or not. If any issue is not closed before the expected completion time then it is a bad smell.

***Results :***
The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_exceeding_due_date/Issues_exceeding_due_date_p1.png)

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_exceeding_due_date/Issues_exceeding_due_date_p2.png)

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Issues_exceeding_due_date/Issues_exceeding_due_date_p3.png)

**6. Label Distribution**
In this feature we have determined the number of issues assigned to a particular label. If any label has issues more than mean by 1.5 times the standard deviation, then it is a bad smell. Same is the case with labels with less or no issues. If the number of issues to a label is less than mean by 1.5 times standard deviation it is a bad smell.

<br>*Criteria:*

        no_of_issues > mean + 1.5 * std_deviation
        OR no_of_issues < mean - 1.5 * std_deviation
        
***Results :***
The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/label_distribution/Project1.png)

**Mean :** 7.00
**Std deviation :** 3.43

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/label_distribution/Project2.png)

**Mean :** 6.48
**Std deviation :** 6.00

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/label_distribution/Project3.png)

**Mean :** 4.36
**Std deviation :** 5.31

**7. Milestones overdue**
In this feature we have analyzed how many milestones were closed before due date and how many milstone were closed after due date. If milestones are not closed before the expected due date, then it is a bad smell.

***Results :***

The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/milestones_skipped/Milestones_skipped_p1.png)

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/milestones_skipped/Milestones_skipped_p2.png)

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/milestones_skipped/Milestones_skipped_p3.png)

**8. Too much time spent on a label**

***Results :***




**9. Very less times spent on a label**

***Results :***




**10. Milestones with fewer issues**
In this featue we analyzed the number of issues assigned to a particular milestone. If any milestone has issues less than mean by 1.5 times standard deviation, then it is a bad smell.

<br>*Criteria:*

        no_of_issues_in_milestone < mean + 1.5 * std_deviation

***Results :***

The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P1.png)

**Mean :** 5.50
**Std deviation :** 2.69

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P2.png)

**Mean :** 2.75
**Std deviation :** 2.05

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P3.png)

**Mean :** 7.80
**Std deviation :** 4.62

**11. Milestone with too many issues**
In this featue we analyzed the number of issues assigned to a particular milestone. If any milestone has issues more than mean by 1.5 times standard deviation, then it is a bad smell.

<br>*Criteria:*

        no_of_issues_in_milestone > mean + 1.5 * std_deviation
        
***Results :***

The results are represented as graphs below

*Project 1*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P1.png)

**Mean :** 5.50
**Std deviation :** 2.69

*Project 2*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P2.png)

**Mean :** 2.75
**Std deviation :** 2.05

*Project 3*
![](https://github.com/NCSU-CSC510/Bad-Smells/blob/master/graphs/Milestones_Issues/Milestones_Issues_P3.png)

**Mean :** 7.80
**Std deviation :** 4.62


##Early Warning
We have created a detector that detects if a developer is overloaded or underloaded with respect to the number of issues assigned to him/her.

###Algorithm:
1. Group the data by week such that (W0<W1<W2..Wi)
where W0 = week the project began ,
Wi = current week

2. Calculate issues assigned to the assignees on a per week basis.

3. For week W0, calculate the mean(M0) of the issues assigned .

4. Use this value to analyze the work distribution for week W1.

5. If the number of issues assigned to an assignee Ai is greater than M0, it is likely that Ai is overloaded.

6. On the other hand,if the number of issues assigned to an assignee Ai is lesser than M0, it is likely that Ai is underloaded and take on more work.

###Usage

This detector can be used to catch any uneven distribution of work among the team early on. It can be used to prevent the situation where there is a dictator or passenger in the team.

##Early Warning Results



