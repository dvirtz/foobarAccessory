/*
Theme.js
(c) 2007 Chris Mrazek
*/

function UpdateLayout()
{
	// The layouts of the different display modes are still hardcoded, because letting the theme
	// take control would introduce more complexity than I want to deal with right now.
	// Maybe another day.
	
	try
	{
		// Load up the theme XML doc
		var xml = new ActiveXObject("Microsoft.XMLDOM");
		xml.load(k_themesDir + "\\" + g_theme + "\\Theme.xml");
		
		// Determine which layout we should be using
		var layout = "";
		if (System.Gadget.docked) layout = g_dockedLayout;
		else layout = g_undockedLayout;
		
		InitThemeStyles();
		
		// start apply custom layout
		if (!ApplyThemeLayout(xml, layout))
		{
			// Failed to apply the layout as specified in the XML file.
			// Use the old hardcoded layout.
			
			document.body.style.width = 130;
			document.body.style.height = 195;
			g_menuGrowBodyNormal = 0;
			g_menuGrowBodyShow = 0;
			BuildBackground(xml, 130, 195);
			
			var left = 5;
			var right = 125;
			var top = 2;
			
			var middle = Math.floor((right - left) * .5) + left;
			var width = right - left;
			var ypos = top;
			var xpos = left;
			
			MoveElement(divTitleContainer, left, ypos, width, 12);	ypos += 12;
			MoveElement(divArtistContainer, left, ypos, width, 12);	ypos += 12;
			MoveElement(divAlbumContainer, left, ypos, width, 12);	ypos += 12;
			divTitleContainer.style.visibility = "visible";
			divArtistContainer.style.visibility = "visible";
			divAlbumContainer.style.visibility = "visible";
			
			xpos = middle - (12 + 12 + 12 + 6);
			MoveElement(rating0, xpos, ypos, 12, 12);	xpos += 12;
			MoveElement(rating1, xpos, ypos, 12, 12);	xpos += 12;
			MoveElement(rating2, xpos, ypos, 12, 12);	xpos += 12;
			MoveElement(rating3, xpos, ypos, 12, 12);	xpos += 12;
			MoveElement(rating4, xpos, ypos, 12, 12);	xpos += 12;
			MoveElement(rating5, xpos, ypos, 12, 12);	xpos += 12;
			rating0.style.visibility = "visible";
			rating1.style.visibility = "visible";
			rating2.style.visibility = "visible";
			rating3.style.visibility = "visible";
			rating4.style.visibility = "visible";
			rating5.style.visibility = "visible";
			ypos += 12 + 3;
			
			ShowElement(artwork, middle - 50, ypos, 100, 100);
			ypos += 100 + 3;
			
			xpos = left;
			MoveElement(timePassed, left, ypos, left + 25, 10);
			MoveElement(timeRemain, right - 25, ypos, 25, 10);
			MoveElement(timerBack, left + 25, ypos, width - (25 * 2), 10);
			MoveElement(timerFront, left + 25, ypos, 0, 10);
			timePassed.style.visibility = "visible";
			timeRemain.style.visibility = "visible";
			timerBack.style.visibility = "visible";
			timerFront.style.visibility = "visible";
			ypos += 10 + 4;
			
			MoveElement(playButton, middle - 10, ypos, 20, 20);
			MoveElement(prevButton, middle - 10 - 20, ypos + 3, 20, 14);
			MoveElement(nextButton, middle + 10, ypos + 3, 20, 14);
			MoveElement(menuButton, left, ypos + 10, 10, 10);
			MoveElement(volumeButton, right - 10, ypos + 10, 10, 10);
			MoveElement(muteButton, right - 22, ypos + 10, 10, 10);
			MoveElement(volumeBack, volumeButton.offsetLeft, volumeButton.offsetTop - 50, 10, 50);
			volumeButton.style.visibility = "visible";
			muteButton.style.visibility = "visible";
			g_volumeSliderOrientation = "vertical";
			ypos += 20;
			
			g_menuWidth = width;
			g_menuHeight = ypos;
			MoveElement(menuHeader, 0, 0, width, 0);
			menuContent.style.left = 0;
			menuContent.style.top = menuHeader.offsetHeight;
			MoveElement(menuCloseButton, width - 10 - 2, Math.floor(menuHeader.offsetHeight / 2) - 5, 10, 10);
		}
		
		if (g_volumeSliderOrientation == "vertical")
		{
			volumeBack.setAttribute("className", "volumeBack");
			volumeFront.setAttribute("className", "volumeFront");
		}
		else
		{
			volumeBack.setAttribute("className", "volumeHBack");
			volumeFront.setAttribute("className", "volumeHFront");
		}
		g_soundVolume = -1;	// force update the next time it's displayed
		
		UpdateThemeStyles(xml);
		UpdateButtons();
		UpdateStaticButtons();
		UpdateRating();
		UpdateTextIntervals();
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when updating layout for theme '" + g_theme + "'.");
	}
}

function BuildBackground(xml, gadgetWidth, gadgetHeight)
{
	// Clear out any existing background elements
	backgroundContainer.innerHTML = "";
	
	var backgroundList = xml.getElementsByTagName("background");
	if (backgroundList.length == 0) throw new Error(0, "No background element could be found in theme XML file.");
	var backgroundElem = backgroundList[0];
	
	var imgList = backgroundElem.getElementsByTagName("img");
	for (var imgIndex = 0; imgIndex < imgList.length; imgIndex++)
	{
		var good = true;
		var imgElem = imgList[imgIndex];
		var leftAttrib, topAttrib, widthAttrib, heightAttrib, srcAttrib;
		var leftCoord = 0, topCoord = 0, widthValue = 0, heightValue = 0;
		
		if (good && (leftAttrib = imgElem.getAttribute("left")) != null)
		{
			try
			{
				eval("leftCoord = (" + leftAttrib + ");");
				if (isNaN(leftCoord))
				{
					EventLog(LogError, "Theme " + g_theme + ": Left coord is NaN ('" + leftAttrib + "')");
					good = false;
				}
			}
			catch(ex)
			{
				EventLogEx(LogError, ex, "Theme " + g_theme + ": Exception when evaluating left coord value '" + leftAttrib + "'");
				good = false;
			}
		}
		
		if (good && (topAttrib = imgElem.getAttribute("top")) != null)
		{
			try
			{
				eval("topCoord = (" + topAttrib + ");");
				if (isNaN(topCoord))
				{
					EventLog(LogError, "Theme " + g_theme + ": Top coord is NaN ('" + topAttrib + "')");
					good = false;
				}
			}
			catch(ex)
			{
				EventLogEx(LogError, ex, "Theme " + g_theme + ": Exception when evaluating top coord value '" + topAttrib + "'");
				good = false;
			}
		}
		
		if (good && (widthAttrib = imgElem.getAttribute("width")) != null)
		{
			try
			{
				eval("widthValue = (" + widthAttrib + ");");
				if (isNaN(widthValue))
				{
					EventLog(LogError, "Theme " + g_theme + ": Width value is NaN ('" + widthAttrib + "')");
					good = false;
				}
			}
			catch(ex)
			{
				EventLogEx(LogError, ex, "Theme " + g_theme + ": Exception when evaluating width value '" + widthAttrib + "'");
				good = false;
			}
		}
		
		if (good && (heightAttrib = imgElem.getAttribute("height")) != null)
		{
			try
			{
				eval("heightValue = (" + heightAttrib + ");");
				if (isNaN(heightValue))
				{
					EventLog(LogError, "Theme " + g_theme + ": Height value is NaN ('" + heightAttrib + "')");
					good = false;
				}
			}
			catch(ex)
			{
				EventLogEx(LogError, ex, "Theme " + g_theme + ": Exception when evaluating height value '" + heightAttrib + "'");
				good = false;
			}
		}
		
		if (good && (srcAttrib = imgElem.getAttribute("src")) != null)
		{
			if (srcAttrib == "")
			{
				EventLog(LogError, "Theme " + g_theme + ": src attribute is empty.");
				good = false;
			}
		}
		
		if (good)
		{
			var elem = document.createElement("img");
			elem.style.position = "absolute";
			elem.style.left = leftCoord;
			elem.style.top = topCoord;
			elem.style.width = widthValue;
			elem.style.height = heightValue;
			elem.src = k_themesDir + "\\" + g_theme + "\\" + srcAttrib;
			
			backgroundContainer.appendChild(elem);
		}
		
	}
}

function InitThemeStyles()
{
	g_ratingNoneImage = "";
	g_ratingOffImage = "";
	g_ratingOnImage = "";
	g_ratingHoverImage = "";
	g_noArtworkImage = "";
	g_sliderHBackImage = "";
	g_sliderHForeImage = "";
	g_sliderVBackImage = "";
	g_sliderVForeImage = "";
	g_playInactiveImage = "";
	g_playActiveImage = "";
	g_playActiveHoverImage = "";
	g_pauseInactiveImage = "";
	g_pauseActiveImage = "";
	g_pauseActiveHoverImage = "";
	g_prevInactiveImage = "";
	g_prevActiveImage = "";
	g_prevActiveHoverImage = "";
	g_nextInactiveImage = "";
	g_nextActiveImage = "";
	g_nextActiveHoverImage = "";
	g_menuActiveImage = "";
	g_menuActiveHoverImage = "";
	g_muteInactiveImage = "";
	g_muteOffActiveImage = "";
	g_muteOffActiveHoverImage = "";
	g_muteOnActiveImage = "";
	g_muteOnActiveHoverImage = "";
	g_volumeInactiveImage = "";
	g_volumeActiveImage = "";
	g_volumeActiveHoverImage = "";
	g_menuCloseActiveImage = "";
	g_menuCloseActiveHoverImage = "";
	g_menuSeparatorImage = "";
}

function UpdateThemeStyles(xml)
{
	// This function updates the colors and images to match the current theme.
	
	var temp, gradTop, gradBottom;
	
	// Load styles
	
	ClearStyleDefs();
	
	var xmlStylesList = xml.getElementsByTagName("styles");
	if (xmlStylesList.length > 0)
	{
		var xmlStyles = xmlStylesList[0];
		
		var xmlControlList = xmlStyles.getElementsByTagName("style");
		for (var controlIndex = 0; controlIndex < xmlControlList.length; controlIndex++)
		{
			var xmlControl = xmlControlList[controlIndex];
			
			var id = xmlControl.getAttribute("id");
			if (id == null || id == "") throw new Error(0, "Style-control id attribute missing.");
			
			var styleDef = new StyleDef(id);
			styleDef.LoadFromXml(xmlControl);
			AddStyleDef(styleDef);
		}
		
	}
	
	// Process styles for each control
	
	{
		// Apply each style for the controls
		
		var styleDef = GetStyleDef("title");
		if (styleDef == null) styleDef = new StyleDef("title");
		styleDef.ApplyToElement(divTitleContainer);
		
		styleDef = GetStyleDef("artist");
		if (styleDef == null) styleDef = new StyleDef("artist");
		styleDef.ApplyToElement(divArtistContainer);
		
		styleDef = GetStyleDef("album");
		if (styleDef == null) styleDef = new StyleDef("album");
		styleDef.ApplyToElement(divAlbumContainer);
		
		styleDef = GetStyleDef("timePassed");
		if (styleDef == null) styleDef = new StyleDef("timePassed");
		styleDef.ApplyToElement(timePassed);
		
		styleDef = GetStyleDef("timeRemain");
		if (styleDef == null) styleDef = new StyleDef("timeRemain");
		styleDef.ApplyToElement(timeRemain);
		
		styleDef = GetStyleDef("titleEdit");
		if (styleDef == null) styleDef = new StyleDef("titleEdit");
		styleDef.ApplyToElement(editTitle);
		
		styleDef = GetStyleDef("artistEdit");
		if (styleDef == null) styleDef = new StyleDef("artistEdit");
		styleDef.ApplyToElement(editArtist);
		
		styleDef = GetStyleDef("albumEdit");
		if (styleDef == null) styleDef = new StyleDef("albumEdit");
		styleDef.ApplyToElement(editAlbum);
		
		styleDef = GetStyleDef("menuBackground");
		if (styleDef == null) styleDef = new StyleDef("menuBackground");
		styleDef.ApplyToElement(menuDiv);
		
		styleDef = GetStyleDef("menuHeaderBackground");
		if (styleDef == null) styleDef = new StyleDef("menuHeaderBackground");
		styleDef.ApplyToElement(menuHeader);
		
		// Ensure all styles are filled in for menus.
		// These are not applied right now. They will be applied when the menu is created.
		
		if (GetStyleDef("menuItem") == null)			AddStyleDef(new StyleDef("menuItem"));
		if (GetStyleDef("menuItemSelected") == null)	AddStyleDef(new StyleDef("menuItemSelected"));
		if (GetStyleDef("menuItemHover") == null)		AddStyleDef(new StyleDef("menuItemHover"));
		if (GetStyleDef("menuHeader") == null)			AddStyleDef(new StyleDef("menuHeader"));
	}
	
	// Images
	
	{
		if (g_ratingNoneImage == "")			g_ratingNoneImage = GetThemeImage(xml, "ratingNone");
		if (g_ratingOffImage == "")				g_ratingOffImage = GetThemeImage(xml, "ratingOff");
		if (g_ratingOnImage == "")				g_ratingOnImage = GetThemeImage(xml, "ratingOn");
		if (g_ratingHoverImage == "")			g_ratingHoverImage = GetThemeImage(xml, "ratingHover");
		if (g_noArtworkImage == "")				g_noArtworkImage = GetThemeImage(xml, "noArtwork", true);	// optional
		if (g_sliderHBackImage == "")			g_sliderHBackImage = GetThemeImage(xml, "sliderHBack");
		if (g_sliderHForeImage == "")			g_sliderHForeImage = GetThemeImage(xml, "sliderHFore");
		if (g_sliderVBackImage == "")			g_sliderVBackImage = GetThemeImage(xml, "sliderVBack");
		if (g_sliderVForeImage == "")			g_sliderVForeImage = GetThemeImage(xml, "sliderVFore");
		if (g_playInactiveImage == "")			g_playInactiveImage = GetThemeImage(xml, "playInactive");
		if (g_playActiveImage == "")			g_playActiveImage = GetThemeImage(xml, "playActive");
		if (g_playActiveHoverImage == "")		g_playActiveHoverImage = GetThemeImage(xml, "playActiveHover");
		if (g_pauseInactiveImage == "")			g_pauseInactiveImage = GetThemeImage(xml, "pauseInactive");
		if (g_pauseActiveImage == "")			g_pauseActiveImage = GetThemeImage(xml, "pauseActive");
		if (g_pauseActiveHoverImage == "")		g_pauseActiveHoverImage = GetThemeImage(xml, "pauseActiveHover");
		if (g_prevInactiveImage == "")			g_prevInactiveImage = GetThemeImage(xml, "prevInactive");
		if (g_prevActiveImage == "")			g_prevActiveImage = GetThemeImage(xml, "prevActive");
		if (g_prevActiveHoverImage == "")		g_prevActiveHoverImage = GetThemeImage(xml, "prevActiveHover");
		if (g_nextInactiveImage == "")			g_nextInactiveImage = GetThemeImage(xml, "nextInactive");
		if (g_nextActiveImage == "")			g_nextActiveImage = GetThemeImage(xml, "nextActive");
		if (g_nextActiveHoverImage == "")		g_nextActiveHoverImage = GetThemeImage(xml, "nextActiveHover");
		if (g_menuActiveImage == "")			g_menuActiveImage = GetThemeImage(xml, "menuActive");
		if (g_menuActiveHoverImage == "")		g_menuActiveHoverImage = GetThemeImage(xml, "menuActiveHover");
		if (g_muteInactiveImage == "")			g_muteInactiveImage = GetThemeImage(xml, "muteInactive");
		if (g_muteOffActiveImage == "")			g_muteOffActiveImage = GetThemeImage(xml, "muteOffActive");
		if (g_muteOffActiveHoverImage == "")	g_muteOffActiveHoverImage = GetThemeImage(xml, "muteOffActiveHover");
		if (g_muteOnActiveImage == "")			g_muteOnActiveImage = GetThemeImage(xml, "muteOnActive");
		if (g_muteOnActiveHoverImage == "")		g_muteOnActiveHoverImage = GetThemeImage(xml, "muteOnActiveHover");
		if (g_volumeInactiveImage == "")		g_volumeInactiveImage = GetThemeImage(xml, "volumeInactive");
		if (g_volumeActiveImage == "")			g_volumeActiveImage = GetThemeImage(xml, "volumeActive");
		if (g_volumeActiveHoverImage == "")		g_volumeActiveHoverImage = GetThemeImage(xml, "volumeActiveHover");
		if (g_menuCloseActiveImage == "")		g_menuCloseActiveImage = GetThemeImage(xml, "menuCloseActive");
		if (g_menuCloseActiveHoverImage == "")	g_menuCloseActiveHoverImage = GetThemeImage(xml, "menuCloseActiveHover");
		if (g_menuSeparatorImage == "")			g_menuSeparatorImage = GetThemeImage(xml, "menuSeparator");

		
		if (!g_gotArtwork)
		{
			ChangeArtwork(g_noArtworkImage);
		}
		
		volumeBack.src = g_sliderVBackImage;
		volumeFront.src = g_sliderVForeImage;
		timerBack.src = g_sliderHBackImage;
		timerFront.src = g_sliderHForeImage;
		
		if (g_volumeSliderOrientation == "vertical")
		{
			volumeBack.src = g_sliderVBackImage;
			volumeFront.src = g_sliderVForeImage;
		}
		else
		{
			volumeBack.src = g_sliderHBackImage;
			volumeFront.src = g_sliderHForeImage;
		}
	}
}

function GetThemeAttrib(xml, category, attrib, defValue)
{
	var elemList = xml.getElementsByTagName(category);
	if (elemList.length == 0)
	{
		if (defValue == null) throw new Error(0, "Theme XML element '" + category + "' is missing.");
		return defValue;
	}
	
	var value = elemList[0].getAttribute(attrib);
	if (value == null)
	{
		if (defValue == null) throw new Error(0, "Theme XML attribute '" + category + "' - '" + attrib + "' is missing.");
		return defValue;
	}
	
	return value;
}

function GetThemeImage(xml, attrib, optional)
{
	var defaultValue = null;
	if (optional != null && optional == true) defaultValue = "";
	
	var value = GetThemeAttrib(xml, "images", attrib, defaultValue);
	return k_themesDir + "\\" + g_theme + "\\" + value;
}

function ApplyThemeLayout(xml, currentLayoutName)
{
	var layoutsList = xml.getElementsByTagName("layouts");
	if (layoutsList.length == 0) return false;
	var layoutsElem = layoutsList[0];
	
	var layoutList = layoutsElem.getElementsByTagName("layout");
	for (var layoutIndex = 0; layoutIndex < layoutList.length; layoutIndex++)
	{
		var layoutElem = layoutList[layoutIndex];
		var layoutName = layoutElem.getAttribute("name");
		
		if (layoutName == currentLayoutName)
		{
			try
			{
				ApplyLayout(xml, layoutElem);
				return true;
			}
			catch(ex)
			{
				EventLogEx(LogError, ex, "Exception when applying layout '" + layoutName + "'.");
			}
		}
	}
	
	return false;
}

function ApplyLayout(xml, layout)
{
	var bodyWidth = layout.getAttribute("width");
	if (bodyWidth == null) throw new Error(0, "No gadget width specified.");
	if (bodyWidth <= 0) throw new Error(0, "Invalid gadget width '" + bodyWidth + "'.");
	g_bodyWidth = bodyWidth;
	
	var bodyHeight = layout.getAttribute("height");
	if (bodyHeight == null) throw new Error(0, "No gadget height specified.");
	if (bodyHeight <= 0) throw new Error(0, "Invalid gadget height '" + bodyHeight + "'.");
	g_bodyHeight = bodyHeight;
	
	InitConfigItems();
	
	var lastLeft = 0;
	var lastTop = 0;
	var lastWidth = 0;
	var lastHeight = 0;
	var lastRight = 0;
	var lastBottom = 0;
	
	for (var childIndex = 0; childIndex < layout.childNodes.length; childIndex++)
	{
		var node = layout.childNodes[childIndex];
		if (node.nodeType == 1)	// 1 = NODE_ELEMENT
		{
			switch(String(node.nodeName))
			{
			case "script":
				eval(node.text);
				break;
				
			case "control":
				var controlId = node.getAttribute("id");
				if (controlId == null) throw new Error(0, "Control element has no id attribute.");
				controlId = String(controlId);
				ValidateControlId(controlId);
				
				// Left
				
				var controlLeft = node.getAttribute("left");
				if (controlLeft != null)
				{
					try
					{
						 eval("controlLeft = " + controlLeft + ";");
					}
					catch(ex)
					{
						throw new Error(0, "Control '" + controlId + "' failed to evaluate left expression.");
					}
				}
				else controlLeft = 0;
				controlLeft = Number(controlLeft);
				if (isNaN(controlLeft)) throw new Error(0, "Control '" + controlId + "' left attribute is NaN.");
				
				// Top
				
				var controlTop = node.getAttribute("top");
				if (controlTop != null)
				{
					try
					{
						 eval("controlTop = " + controlTop + ";");
					}
					catch(ex)
					{
						throw new Error(0, "Control '" + controlId + "' failed to evaluate top expression.");
					}
				}
				else controlTop = 0;
				controlTop = Number(controlTop);
				if (isNaN(controlTop)) throw new Error(0, "Control '" + controlId + "' top attribute is NaN.");
				
				// Width
				
				var controlWidth = node.getAttribute("width");
				if (controlWidth != null)
				{
					try
					{
						 eval("controlWidth = " + controlWidth + ";");
					}
					catch(ex)
					{
						throw new Error(0, "Control '" + controlId + "' failed to evaluate width expression.");
					}
				}
				else controlWidth = 0;
				controlWidth = Number(controlWidth);
				if (isNaN(controlWidth)) throw new Error(0, "Control '" + controlId + "' width attribute is NaN.");
				
				// Height
				
				var controlHeight = node.getAttribute("height");
				if (controlHeight != null)
				{
					try
					{
						 eval("controlHeight = " + controlHeight + ";");
					}
					catch(ex)
					{
						throw new Error(0, "Control '" + controlId + "' failed to evaluate height expression.");
					}
				}
				else controlHeight = 0;
				controlHeight = Number(controlHeight);
				if (isNaN(controlHeight)) throw new Error(0, "Control '" + controlId + "' height attribute is NaN.");
				
				// Visible
				
				var controlVisible = node.getAttribute("visible");
				if (controlVisible != null)
				{
					try
					{
						 eval("controlVisible = " + controlVisible + ";");
					}
					catch(ex)
					{
						throw new Error(0, "Control '" + controlId + "' failed to evaluate visible expression.");
					}
				}
				else controlVisible = true;
				controlVisible = controlVisible == true;	// Ensure it really is a bool
				
				// Image
				
				if (controlId == "artwork")
				{
					var controlImage = node.getAttribute("image");
					if (controlImage != null)
					{
						g_noArtworkImage = k_themesDir + "\\" + g_theme + "\\" + controlImage;
					}
				}
				
				ConfigureControl(controlId, node, controlLeft, controlTop, controlWidth, controlHeight, controlVisible);
				
				lastLeft = controlLeft;
				lastTop = controlTop;
				lastWidth = controlWidth;
				lastHeight = controlHeight;
				lastRight = controlLeft + controlWidth;
				lastBottom = controlTop + controlHeight;
				
				break;
			}
		}
	}
	
	CleanUpConfigItems();
	
	document.body.style.width = bodyWidth;
	document.body.style.height = bodyHeight;
	BuildBackground(xml, bodyWidth, bodyHeight);
}

function ValidateControlId(controlId)
{
	// This function will throw an error if the control id is not valid
	
	switch(String(controlId))
	{
	case "title":
	case "artist":
	case "album":
	case "rating0":
	case "rating1":
	case "rating2":
	case "rating3":
	case "rating4":
	case "rating5":
	case "artwork":
	case "timePassed":
	case "timeRemain":
	case "timeSlider":
	case "play":
	case "prev":
	case "next":
	case "menu":
	case "volume":
	case "mute":
	case "volumeSlider":
	case "menuDialog":
		break;
		
	default:
		throw new Error(0, "Unknown control id '" + controlId + "'.");
	}
}

function ConfigureControl(controlId, element, controlLeft, controlTop, controlWidth, controlHeight, controlVisible, controlImage, controlHoverImage)
{
	switch(String(controlId))
	{
	case "title":
		MoveElement(divTitleContainer, controlLeft, controlTop, controlWidth, controlHeight);
		MoveElement(editTitle, controlLeft, controlTop - 2, controlWidth, controlHeight + 2);
		divTitleContainer.style.visibility = controlVisible ? "visible" : "hidden";
		g_configTitle = true;
		break;
		
	case "artist":
		MoveElement(divArtistContainer, controlLeft, controlTop, controlWidth, controlHeight);
		MoveElement(editArtist, controlLeft, controlTop - 2, controlWidth, controlHeight + 2);
		divArtistContainer.style.visibility = controlVisible ? "visible" : "hidden";
		g_configArtist = true;
		break;
		
	case "album":
		MoveElement(divAlbumContainer, controlLeft, controlTop, controlWidth, controlHeight);
		MoveElement(editAlbum, controlLeft, controlTop - 2, controlWidth, controlHeight + 2);
		divAlbumContainer.style.visibility = controlVisible ? "visible" : "hidden";
		g_configAlbum = true;
		break;
		
	case "rating0":
		MoveElement(rating0, controlLeft, controlTop, controlWidth, controlHeight);
		rating0.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating0 = true;
		break;
		
	case "rating1":
		MoveElement(rating1, controlLeft, controlTop, controlWidth, controlHeight);
		rating1.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating1 = true;
		break;
		
	case "rating2":
		MoveElement(rating2, controlLeft, controlTop, controlWidth, controlHeight);
		rating2.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating2 = true;
		break;
		
	case "rating3":
		MoveElement(rating3, controlLeft, controlTop, controlWidth, controlHeight);
		rating3.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating3 = true;
		break;
		
	case "rating4":
		MoveElement(rating4, controlLeft, controlTop, controlWidth, controlHeight);
		rating4.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating4 = true;
		break;
		
	case "rating5":
		MoveElement(rating5, controlLeft, controlTop, controlWidth, controlHeight);
		rating5.style.visibility = controlVisible ? "visible" : "hidden";
		g_configRating5 = true;
		break;
		
	case "artwork":
		MoveElement(artworkFrame, controlLeft, controlTop, controlWidth, controlHeight);
		artwork.style.height = controlHeight;
		artwork.style.visibility = controlVisible ? "visible" : "hidden";
		g_artworkVisible = controlVisible;
		g_configArtwork = true;
		break;
		
	case "timePassed":
		MoveElement(timePassed, controlLeft, controlTop, controlWidth, controlHeight);
		timePassed.style.visibility = controlVisible ? "visible" : "hidden";
		g_configTimePassed = true;
		break;
		
	case "timeRemain":
		MoveElement(timeRemain, controlLeft, controlTop, controlWidth, controlHeight);
		timeRemain.style.visibility = controlVisible ? "visible" : "hidden";
		g_configTimeRemain = true;
		break;
		
	case "timeSlider":
		MoveElement(timerBack, controlLeft, controlTop, controlWidth, controlHeight);
		timerBack.style.visibility = controlVisible ? "visible" : "hidden";
		MoveElement(timerFront, controlLeft, controlTop, null, null);
		g_configTimeSlider = true;
		break;
		
	case "play":
		MoveElement(playButton, controlLeft, controlTop, controlWidth, controlHeight);
		playButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configPlay = true;
		break;
		
	case "prev":
		MoveElement(prevButton, controlLeft, controlTop, controlWidth, controlHeight);
		prevButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configPrev = true;
		break;
		
	case "next":
		MoveElement(nextButton, controlLeft, controlTop, controlWidth, controlHeight);
		nextButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configNext = true;
		break;
		
	case "menu":
		MoveElement(menuButton, controlLeft, controlTop, controlWidth, controlHeight);
		menuButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configMenu = true;
		break;
		
	case "volume":
		MoveElement(volumeButton, controlLeft, controlTop, controlWidth, controlHeight);
		volumeButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configVolume = true;
		break;
		
	case "mute":
		MoveElement(muteButton, controlLeft, controlTop, controlWidth, controlHeight);
		muteButton.style.visibility = controlVisible ? "visible" : "hidden";
		g_configMute = true;
		break;
	
	case "volumeSlider":
		MoveElement(volumeBack, controlLeft, controlTop, controlWidth, controlHeight);
		// Volume slider visibility is controlled automagically. Don't override it here.
		
		if (controlWidth >= controlHeight)
		{
			g_volumeSliderOrientation = "horizontal";
		}
		else
		{
			g_volumeSliderOrientation = "vertical";
		}
		g_configVolumeSlider = true;
		break;
		
	case "menuDialog":
		g_menuWidth = controlWidth;
		g_menuHeight = controlHeight;
		
		if (controlHeight + controlTop > g_bodyHeight)
		{
			g_menuGrowBodyNormal = g_bodyHeight;
			g_menuGrowBodyShow = controlHeight + controlTop;
		}
		else
		{
			g_menuGrowBodyNormal = 0;
			g_menuGrowBodyShow = 0;
		}
		
		MoveElement(menuDiv, controlLeft, controlTop, controlWidth, controlHeight);
		MoveElement(menuHeader, 0, 0, controlWidth, 0);
		MoveElement(menuContent, 0, menuHeader.offsetHeight, null, null);
		MoveElement(menuCloseButton, controlWidth - 10 - 2, Math.floor(menuHeader.offsetHeight / 2) - 5, 10, 10);
		
		g_configMenuDialog = true;
		
		// Don't need to set menu visibility here. It is done automatically when button is clicked.
		break;
	}
}



function InitConfigItems()
{
	g_configTitle = false;
	g_configArtist = false;
	g_configAlbum = false;
	g_configRating0 = false;
	g_configRating1 = false;
	g_configRating2 = false;
	g_configRating3 = false;
	g_configRating4 = false;
	g_configRating5 = false;
	g_configArtwork = false;
	g_configTimePassed = false;
	g_configTimeRemain = false;
	g_configTimeSlider = false;
	g_configPlay = false;
	g_configPrev = false;
	g_configNext = false;
	g_configMenu = false;
	g_configVolume = false;
	g_configMute = false;
	g_configVolumeSlider = false;
	g_configMenuDialog = false;

}

function CleanUpConfigItems()
{
	// This function runs after the theme file has been executed.
	// It detects which controls were not touched by the theme file, and hides them.
	
	if (!g_configTitle)
	{
		divTitleContainer.style.visibility = "hidden";
	}
	
	if (!g_configArtist)
	{
		divArtistContainer.style.visibility = "hidden";
	}
	
	if (!g_configAlbum)
	{
		divAlbumContainer.style.visibility = "hidden";
	}
	
	if (!g_configRating0)
	{
		rating0.style.visibility = "hidden";
	}
	
	if (!g_configRating1)
	{
		rating1.style.visibility = "hidden";
	}
	
	if (!g_configRating2)
	{
		rating2.style.visibility = "hidden";
	}
	
	if (!g_configRating3)
	{
		rating3.style.visibility = "hidden";
	}
	
	if (!g_configRating4)
	{
		rating4.style.visibility = "hidden";
	}
	
	if (!g_configRating5)
	{
		rating5.style.visibility = "hidden";
	}

	if (!g_configArtwork)
	{
		artwork.style.visibility = "hidden";
		g_artworkVisible = false;
	}
	
	if (!g_configTimePassed)
	{
		timePassed.style.visibility = "hidden";
	}
	
	if (!g_configTimeRemain)
	{
		timeRemain.style.visibility = "hidden";
	}
	
	if (!g_configTimeSlider)
	{
		timerBack.style.visibility = "hidden";
		timerFront.style.visibility = "hidden";
	}
	
	if (!g_configPlay)
	{
		playButton.style.visibility = "hidden";
	}
	
	if (!g_configPrev)
	{
		prevButton.style.visibility = "hidden";
	}
	
	if (!g_configNext)
	{
		nextButton.style.visibility = "hidden";
	}
	
	if (!g_configMenu)
	{
		menuButton.style.visibility = "hidden";
	}
	
	if (!g_configVolume)
	{
		volumeButton.style.visibility = "hidden";
	}
	
	if (!g_configMute)
	{
		muteButton.style.visibility = "hidden";
	}
	
	if (!g_configVolumeSlider)
	{
		volumeBack.style.visibility = "hidden";
		volumeFront.style.visibility = "hidden";
	}
}
