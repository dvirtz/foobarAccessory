/*
Settings.js
(c) 2007 Chris Mrazek
*/

var fso = new ActiveXObject("Scripting.FileSystemObject");

System.Gadget.onSettingsClosing = SettingsClosing;
			
function Init()
{
	var value;
	
	value = System.Gadget.Settings.readString("AutoArtworkDownload");
	if (value != "") chkAutoArtworkDownload.checked = value == "True";
	else chkAutoArtworkDownload.checked = false;
	
	value = System.Gadget.Settings.readString("DownloadArtworkOnClick");
	if (value != "") chkDownloadArtworkOnClick.checked = value == "True";
	else chkDownloadArtworkOnClick.checked = true;
	
	value = System.Gadget.Settings.readString("ClickArtworkReplaces");
	if (value != "") chkClickArtworkReplaces.checked = value != "True";
	else chkClickArtworkReplaces.checked = true;	// Reversed meaning
	
	value = System.Gadget.Settings.readString("ScrollTitles");
	if (value != "") chkScrollTitles.checked = value == "True";
	else chkScrollTitles.checked = true;
	
	var currentTheme = System.Gadget.Settings.readString("Theme");
	if (currentTheme == "") currentTheme = k_defaultTheme;
	
	PopulateThemeSelect(currentTheme);
	
	var currentDockedLayout = System.Gadget.Settings.readString("DockedLayout");
	var currentUndockedLayout = System.Gadget.Settings.readString("UndockedLayout");
	PopulateLayoutSelect(currentTheme, currentDockedLayout, currentUndockedLayout);
}

function SettingsClosing(event)
{
	if (event.closeAction == event.Action.commit)
	{
		var value;
		
		value = chkAutoArtworkDownload.checked ? "True" : "False";
		System.Gadget.Settings.writeString("AutoArtworkDownload", value);
		
		value = chkDownloadArtworkOnClick.checked ? "True" : "False";
		System.Gadget.Settings.writeString("DownloadArtworkOnClick", value);
		
		value = chkClickArtworkReplaces.checked ? "False" : "True";	// Reversed meaning
		System.Gadget.Settings.writeString("ClickArtworkReplaces", value);
		
		value = chkScrollTitles.checked ? "True" : "False";
		System.Gadget.Settings.writeString("ScrollTitles", value);
		
		value = String(selTheme.value);
		System.Gadget.Settings.writeString("Theme", value);
		
		value = String(selLayoutDocked.value);
		System.Gadget.Settings.writeString("DockedLayout", value);
		
		value = String(selLayoutUndocked.value);
		System.Gadget.Settings.writeString("UndockedLayout", value);
	}
	event.cancel = false;
}

function PopulateThemeSelect(currentTheme)
{
	selTheme.innerHTML = "";
	
	var themeFolder = fso.GetFolder(k_themesDir);
	for (var folderEnum = new Enumerator(themeFolder.SubFolders); !folderEnum.atEnd(); folderEnum.moveNext())
	{
		var folder = folderEnum.item();
		var xmlPathName = folder.Path + "\\Theme.xml";
		
		if (fso.FileExists(xmlPathName))
		{
			var themeName = folder.Name;
			
			var optionElem = document.createElement("option");
			optionElem.value = themeName;
			optionElem.innerText = themeName;
			if (themeName == currentTheme) optionElem.selected = true;
			
			selTheme.appendChild(optionElem);
		}
	}
}

function PopulateLayoutSelect(currentTheme, currentDockedLayout, currentUndockedLayout)
{
	selLayoutDocked.innerHTML = "";
	selLayoutUndocked.innerHTML = "";
	
	try
	{
		var themeXml = new ActiveXObject("Microsoft.XMLDOM");
		themeXml.load(System.Gadget.path + "\\Themes\\" + currentTheme + "\\Theme.xml");
		
		var defaultDockedIndex = null;
		var defaultUndockedIndex = null;
		var foundDockedLayout = false;
		var foundUndockedLayout = false;
		var layoutList = themeXml.getElementsByTagName("layout");
		for (var layoutIndex = 0; layoutIndex < layoutList.length; layoutIndex++)
		{
			var layout = layoutList[layoutIndex];
			var name = layout.getAttribute("name");
			if (name != null)
			{
				// Docked
				
				var allow = layout.getAttribute("allowDocked");
				if (allow == null || allow == "true")
				{
					var optionElem = document.createElement("option");
					optionElem.value = name;
					optionElem.innerText = name;
					if (currentDockedLayout == name)
					{
						optionElem.selected = true;
						foundDockedLayout = true;
					}
					
					selLayoutDocked.appendChild(optionElem);
					
					var isDefaultDocked = layout.getAttribute("defaultDocked");
					if (isDefaultDocked == "true") defaultDockedIndex = layoutIndex;
				}
				
				// Undocked
				
				allow = layout.getAttribute("allowUndocked");
				if (allow == null || allow == "true")
				{
					var optionElem = document.createElement("option");
					optionElem.value = name;
					optionElem.innerText = name;
					if (currentUndockedLayout == name)
					{
						optionElem.selected = true;
						foundUndockedLayout = true;
					}
					
					selLayoutUndocked.appendChild(optionElem);
					
					var isDefaultUndocked = layout.getAttribute("defaultUndocked");
					if (isDefaultUndocked == "true") defaultUndockedIndex = layoutIndex;
				}
			}
		}
		
		if (!foundDockedLayout)
		{
			if (defaultDockedIndex != null) selLayoutDocked.selectedIndex = defaultDockedIndex;
			else selLayoutDocked.selectedIndex = 0;
		}
		
		if (!foundUndockedLayout)
		{
			if (defaultUndockedIndex != null) selLayoutUndocked.selectedIndex = defaultUndockedIndex;
			else selLayoutUndocked.selectedIndex = 0;
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when populating layout select.");
	}
}

function selTheme_Change()
{
	var currentTheme = String(selTheme.value);
	var currentDockedLayout = String(selLayoutDocked.value);
	var currentUndockedLayout = String(selLayoutUndocked.value);
	PopulateLayoutSelect(currentTheme, currentDockedLayout, currentUndockedLayout);
}
