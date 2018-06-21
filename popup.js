var popupLoaded = false;

var filterString = "";
var filterStringsArray;
var filterTimeOut;

function createLink(url)
{
  var link = document.createElement('a');
  link.href = "";
  link.onclick = function(e)
  {
	if (e.button == 1)
	{ 
		e.preventDefault();
		e.stopPropagation();
		showUrl(url,false); 
		loadContent();
	}
	else
	{ 
		showUrl(url,true);
		loadContent();
	}
  };
  link.title = url;
  return link;
}

var nowtime, currentTime;
var content;

function loadContent()
{
  	content = document.getElementById("content");

	nowtime = new Date();
	
	popupLoaded=false;

	if (settings.menuTop == true) content = document.getElementById("content2");
	if (settings.boldFont == true) content.className += " bold";
	if (settings.showTime == true) content.className += " timeEnabled";
	if (settings.showSearch == true) document.getElementById("searchQ").focus(); else document.getElementById("searchQ").style.display="none";
	
	content.innerHTML="<center><b>Loading...</b></center>";
	
	var itemAmount = parseInt(settings.numItems);
	if (filterTimeOut == "" || itemAmount == 0)
		itemAmount = 100;
	chrome.history.search({'text':filterString, 'maxResults':itemAmount }, showResults);
}

function searchFor(string)
{
	console.log('search: ' + string);
	if (string == "")
	{
		filterString="";
		filterStringsArray=null;
	}
	else
	{
		filterString = string.toLowerCase();
		filterStringsArray = filterString.split(" ");
	}
	clearTimeout(filterTimeOut);
	filterTimeOut = setTimeout(loadContent, 500);
}

function showAllHistory()
{
	var str = "chrome://history/";
	if (filterStringsArray!=null) str+="#q="+filterString;
	chrome.tabs.create({"url": str, "selected":true});  
}

function showResults(historyItems)
{
	if (!popupLoaded)
	{
		content.innerHTML = "";
		popupLoaded=true;
	}

	nowtime = new Date();
	currentTime = nowtime.getTime(); 

	for (var i = 0; i < historyItems.length; ++i)
		ShowEntry(historyItems[i]);
		
	if (filterString != "")
	{
		if (historyItems.length == 0)
			content.innerHTML = "<center><b>No items containing \'" + unescape(filterString) + "\'  found</b></center>";
	}
	
	/*
	var nowtime = new Date();
	var end = nowtime.getTime();
	var took = (end - currentTime);

	var textdiv = document.createElement('div');
	textdiv.innerHTML = "This took : " + took + " ms"; 
	content.appendChild(textdiv);*/
}
function ShowEntry(item)
{
	if (!popupLoaded)
		return;

	var text_link = createLink(item.url);
	var html;

	html="<img src=\"chrome://favicon/"+item.url+"\" width=16 height=16>"; 
	
	if (item.title == "") item.title = item.url;
	
	if (filterStringsArray != null) item.title=item.title.multiReplace(filterStringsArray);
	
	html+="<div";
	if (settings.numLines!=0 && !isNaN(settings.numLines)) html+=" class=\"maxh"+settings.numLines+"\"";
	html+="> " + item.title +"</div>";
	
	if (settings.showTime)
	{
		var timeTextz;

		var difference = currentTime - item.lastVisitTime; 
		var hoursDifference = Math.floor(difference/1000/60/60); 
		difference = difference - hoursDifference*1000*60*60 
		var minutesDifference = Math.floor(difference/1000/60); 
		difference = difference - minutesDifference*1000*60 
		var secondsDifference = Math.floor(difference/1000); 
		if (hoursDifference < 1 &&  minutesDifference < 1 &&secondsDifference < 60) timeTextz = '<b>'+ secondsDifference + 's</b> ago'; 
		else if (hoursDifference < 1) timeTextz ='<b>'+ minutesDifference + ' min</b> ago'; 
		else if (hoursDifference < 4) timeTextz = '<b>' + hoursDifference + 'h ' + minutesDifference + 'min</b>'; 
		else if (hoursDifference < 24) timeTextz ='<b>' + hoursDifference + 'h</b> ago'; 
		else
		{
			var daysDiff=Math.floor(hoursDifference/24);
			timeTextz='<b>' + daysDiff + ' days</b> '; 
		}
		html += "<span>"+timeTextz+"</span>";
	}
	
	text_link.innerHTML = html;
	content.appendChild(text_link);
	//pause(10);
}

function stripVowelAccent(str)
{
	var rExps=[ /[\xC0-\xC2]/g, /[\xE0-\xE2]/g,
		/[\xC8-\xCA]/g, /[\xE8-\xEB]/g,
		/[\xCC-\xCE]/g, /[\xEC-\xEE]/g,
		/[\xD2-\xD4]/g, /[\xF2-\xF4]/g,
		/[\xD9-\xDB]/g, /[\xF9-\xFB]/g ];

	var repChar=['A','a','E','e','I','i','O','o','U','u'];

	for (var i=0; i<rExps.length; ++i)
		str=str.replace(rExps[i],repChar[i]);

	return str;
}
String.prototype.multiReplace = function ( strings )
{
	var str_real = this, i;
	var str = str_real;
	str = stripVowelAccent(str);
	str = str.toLowerCase();
	var position=-1;
	for (i = 0; i < strings.length; i++ )
	{
		position = str.indexOf(strings[i]);
		if (position!= -1)
		{
			str_real = str_real.substr(0,position) + "<u>" + str_real.substr(position, strings[i].length) + "</u>" + str_real.substr(position + strings[i].length); 
			str = stripVowelAccent(str_real).toLowerCase();
		}
		//str = str.replace(new RegExp('(' + strings[i] + ')','gi'), replaceBy);
	}
	return str_real;
};

document.addEventListener('DOMContentLoaded', function ()
{
	chrome.storage.sync.get('settings', function(result)
	{
		if (result.settings == undefined)
		{
			settings = default_settings;
			chrome.storage.sync.set({'settings': default_settings}, function(){ });
		}
		else
			settings = result.settings;
		
		loadContent();
	});
	
	document.getElementById('buttonShowAll').addEventListener('click', showAllHistory);
	document.getElementById('searchQ').addEventListener('keyup', function() { searchFor(document.getElementById('searchQ').value); });
});