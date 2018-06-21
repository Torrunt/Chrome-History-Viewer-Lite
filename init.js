var default_settings =
{
	showTime:true, 
	showSearch:true,
	boldFont:false,
	menuTop:true,
	numItems:20,
	numLines:0
};

var settings;

// Show |url| in a new tab.
function showUrl(url,closewindow)
{ 
	var index=999999;

	if (closewindow)
	{
		chrome.tabs.create({"url": url, "index": index,"selected":true});  
		window.close();
	}
	else
		chrome.tabs.create({"url": url, "index": index,"selected":false});  
}