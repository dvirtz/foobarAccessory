/*
Menu.js
(c) 2007 Chris Mrazek
*/

function ClearMenu()
{
	while (g_menuItems.length > 0)
	{
		g_menuItems.pop();
	}
}

function AddMenuItem(text, onclick)
{
	var item = new MenuItem(text, onclick);
	g_menuItems.push(item);
	return item;
}

function AddRawMenuItem(text, onclick)
{
	var item = new MenuItem(text, onclick);
	item.noescape = true;
	g_menuItems.push(item);
	return item;
}

function AddMenuSeparator()
{
	var item = AddMenuItem("", "");
	item.separator = true;
	return item;
}

function ShowMenu()
{
	if (g_menuGrowBodyShow > 0 && g_menuGrowBodyNormal > 0)
	{
		document.body.style.height = g_menuGrowBodyShow;
	}
	
	menuContent.innerHTML = "";
	
	GenerateMenu(menuContent);
	
	var headerStyleDef = GetStyleDef("menuHeader");
	if (headerStyleDef != null) headerStyleDef.ApplyToElement(menuHeaderText);
	
	menuDiv.style.width = g_menuWidth;
	menuDiv.style.height = g_menuHeight;
	menuDiv.style.visibility = "visible";
	g_menuVisible = true;
	
	g_menuScroll = 0;
	g_menuMaxScroll = 0;
	if (g_menuItems.length > 0)
	{
		var lastItem = document.getElementById("menuItem" + (g_menuItems.length - 1));
		g_menuMaxScroll = lastItem.offsetTop + lastItem.offsetHeight;
		g_menuMaxScroll -= menuDiv.offsetHeight - menuHeader.offsetHeight;
		g_menuMaxScroll += 10;	// A little breathing room at the bottom
		if (g_menuMaxScroll < 0) g_menuMaxScroll = 0;
	}
	
	SetMenuScroll(0);
	menuDiv.focus();
}

function GenerateMenu(menuElement)
{
	for (var menuIndex = 0; menuIndex < g_menuItems.length; menuIndex++)
	{
		g_menuItems[menuIndex].GenerateObjects(menuElement, "menuItem" + menuIndex);
	}
}

function CloseMenu()
{
	menuDiv.style.width = 0;
	menuDiv.style.height = 0;
	menuDiv.style.visibility = "hidden";
	g_menuVisible = false;
	
	if (g_menuGrowBodyShow > 0 && g_menuGrowBodyNormal > 0)
	{
		document.body.style.height = g_menuGrowBodyNormal;
	}
	
	ClearMenu();
}

function SetMenuTitle(title)
{
	menuHeaderText.innerText = title;
}

function Menu_KeyDown()
{
	if (event.keyCode == 38) // up arrow
	{
		SetMenuScroll(g_menuScroll - 10);
	}
	else if (event.keyCode == 40) // down arrow
	{
		SetMenuScroll(g_menuScroll + 10);
	}
	else if (event.keyCode == 33)	// page up
	{
		SetMenuScroll(g_menuScroll - menuDiv.offsetHeight);
	}
	else if (event.keyCode == 34)	// page down
	{
		SetMenuScroll(g_menuScroll + menuDiv.offsetHeight);
	}
	else if (event.keyCode == 35)	// end
	{
		SetMenuScroll(g_menuMaxScroll);
	}
	else if (event.keyCode == 36)	// home
	{
		SetMenuScroll(0);
	}
}

function Menu_MouseWheel()
{
	var scrollDist = -(event.wheelDelta / 10);
	SetMenuScroll(g_menuScroll + scrollDist);
}

function SetMenuScroll(scrollPos)
{
	var newScrollPos = scrollPos;
	if (newScrollPos < 0) newScrollPos = 0;
	else if (newScrollPos > g_menuMaxScroll) newScrollPos = g_menuMaxScroll;
	
	g_menuScroll = newScrollPos;
	menuContent.style.top = menuHeader.offsetTop + menuHeader.offsetHeight - newScrollPos;
}

function OnMenuMouseMove()
{
	if (event.ctrlKey && g_menuMaxScroll > 0)
	{
		var mouseY = event.clientY;
		var viewMin = menuHeader.offsetTop + menuHeader.offsetParent.offsetTop + menuHeader.offsetHeight + k_menuItemHeight / 2;
		var viewMax = menuDiv.offsetTop + menuDiv.offsetParent.offsetTop + menuDiv.offsetHeight - k_menuItemHeight / 2;
		
		var ratio;
		if (mouseY < viewMin) ratio = 0;
		else if (mouseY >= viewMax) ratio = 1;
		else ratio = (mouseY - viewMin) / (viewMax - viewMin);
		
		SetMenuScroll(Math.round(g_menuMaxScroll * ratio));
	}
}

function MenuItem(text, onclick)
{
	this.text = text;
	this.onclick = onclick;
	this.selected = false;
	this.separator = false;
	this.noescape = false;
	
	this.GenerateObjects = MenuItem__GenerateObjects;
}

function MenuItem__GenerateObjects(menuElement, id)
{
	var elem = null;
	var styleId = "";
	
	if (this.separator)
	{
		elem = document.createElement("img");
		elem.id = id;
		elem.src = g_menuSeparatorImage;
		elem.style.position = "relative";
	}
	else
	{
		elem = document.createElement("div");
		elem.id = id;
		if (this.selected) elem.className = "menuItemSelect";
		else elem.className = "menuItem";
		
		elem.selected = this.selected;
		
		if (this.selected) styleId = "menuItemSelected";
		else styleId = "menuItem";
		
		// apply styles
		elem.style.position = "relative";
		elem.style.left = 0;
		elem.style.top = 0;
		elem.style.width = menuContent.offsetWidth;
		elem.style.height = k_menuItemHeight;
		
		elem.onclick_js = this.onclick;
		elem.onclick = MenuItem_Click;
		elem.onmouseover = MenuItem_MouseOver;
		elem.onmouseout = MenuItem_MouseOut;
		
		if (this.noescape) elem.innerHTML = this.text;
		else elem.innerText = this.text;
	}
	
	if (styleId != "")
	{
		var styleObj = GetStyleDef(styleId);
		if (styleObj != null) styleObj.ApplyToElement(elem);
	}
	
	menuElement.appendChild(elem);
}

function MenuItem_Click()
{
	CloseMenu();
	eval(event.srcElement.onclick_js, "unsafe");	// onclick_js is a custom attribute
}

function MenuItem_MouseOver()
{
	ApplyMenuItemStyle(event.srcElement, true);
}

function MenuItem_MouseOut()
{
	ApplyMenuItemStyle(event.srcElement, false);
}

function ApplyMenuItemStyle(div, hover)
{
	var styleId = "";
	
	if (hover) styleId = "menuItemHover";
	else if (div.selected) styleId = "menuItemSelected";	// selected is a custom attribute
	else styleId = "menuItem";
	
	var styleDef = GetStyleDef(styleId);
	if (styleDef != null)
	{
		styleDef.ApplyToElement(div);
	}
}
