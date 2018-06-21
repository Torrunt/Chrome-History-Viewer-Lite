function onLoaded()
{
	var widthValue = document.getElementById('numItems-value');
	document.getElementById('numItems').value = widthValue.textContent = settings.numItems;
	document.getElementById('numItems').addEventListener('input', function(event) {widthValue.textContent = event.target.value;}, false);
	
	var lines = document.getElementById('numLines');
	var linesValue = document.getElementById('numLines-value');
	lines.value = linesValue.textContent = parseInt(settings.numLines);

	if (lines.value == 0) linesValue.textContent = "No Limit";
	lines.addEventListener('input', function(event) { if (event.target.value == 0) linesValue.textContent = "No Limit"; else linesValue.textContent = event.target.value;}, false);

	document.getElementById("showTime").checked = settings.showTime;
	document.getElementById("showSearch").checked = settings.showSearch;
	
	document.getElementById("bold").checked = settings.boldFont;
	document.getElementById("menuTop").checked = settings.menuTop;
	
	document.getElementById('saveButton').addEventListener('click', save);
}

function save()
{
	settings.showTime = document.getElementById("showTime").checked;
	settings.showSearch = document.getElementById("showSearch").checked;
	settings.boldFont = document.getElementById("bold").checked;
	settings.menuTop = document.getElementById("menuTop").checked;

	settings.numItems = document.getElementById("numItems").value;
	settings.numLines = parseInt(document.getElementById("numLines").value);


	if (settings.badgeHide)
		chrome.browserAction.setBadgeText({text:""});
	
	chrome.storage.sync.set({'settings': settings}, function()
	{
		document.getElementById("saveMsg").innerHTML = "Saved."
		setTimeout(function() { document.getElementById("saveMsg").innerHTML = ""}, 500);
	});
}

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
		onLoaded();
	});
});