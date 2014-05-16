/*
StyleDef.js
(c) 2007 Chris Mrazek
*/

var g_styleDefs = new Array();

function ClearStyleDefs()
{
	g_styleDefs = new Array();
}

function GetStyleDef(id)
{
	for (var i = 0; i < g_styleDefs.length; i++)
	{
		if (g_styleDefs[i].id == id) return g_styleDefs[i];
	}
	return null;
}

function AddStyleDef(styleDef)
{
	for (var i = 0; i < g_styleDefs.length; i++)
	{
		if (g_styleDefs[i].id == styleDef.id)
		{
			g_styleDefs[i] = styleDef;
			return;
		}
	}
	
	g_styleDefs.push(styleDef);
}

function StyleDef(id)
{
	this.id = String(id);
	
	this.color = "#000000";
	this.backgroundColor = "Transparent";
	this.backgroundImage = "none";
	this.fontFamily = "Tahoma";
	this.fontSize = "8pt";
	this.fontWeight = "normal";
	this.fontStyle = "normal";
	this.borderColor = "#000000";
	this.borderStyle = "none";
	this.borderWidth = "1px";
	this.filter = "";
	
	this.ApplyToElement = StyleDef__ApplyToElement;
	this.LoadFromXml = StyleDef__LoadFromXml;
}

function StyleDef__LoadFromXml(xml)
{
	var value;
	
	value = xml.getAttribute("color");
	if (value != null) this.color = value;
	
	value = xml.getAttribute("backgroundColor");
	if (value != null) this.backgroundColor = value;
	
	value = xml.getAttribute("backgroundImage");
	if (value != null) this.backgroundImage = value;
	
	value = xml.getAttribute("fontFamily");
	if (value != null) this.fontFamily = value;
	
	value = xml.getAttribute("fontSize");
	if (value != null) this.fontSize = value;
	
	value = xml.getAttribute("fontWeight");
	if (value != null) this.fontWeight = value;
	
	value = xml.getAttribute("fontStyle");
	if (value != null) this.fontStyle = value;
	
	value = xml.getAttribute("borderColor");
	if (value != null) this.borderColor = value;
	
	value = xml.getAttribute("borderStyle");
	if (value != null) this.borderStyle = value;
	
	value = xml.getAttribute("borderWidth");
	if (value != null) this.borderWidth = value;
	
	value = xml.getAttribute("filter");
	if (value != null) this.filter = value;
}

function StyleDef__ApplyToElement(element)
{
	element.style.color = this.color;
	element.style.backgroundColor = this.backgroundColor;
	element.style.backgroundImage = this.backgroundImage;
	element.style.fontFamily = this.fontFamily;
	element.style.fontSize = this.fontSize;
	element.style.fontWeight = this.fontWeight;
	element.style.fontStyle = this.fontStyle;
	element.style.borderColor = this.borderColor;
	element.style.borderStyle = this.borderStyle;
	element.style.borderWidth = this.borderWidth;
	element.style.filter = this.filter;
}
