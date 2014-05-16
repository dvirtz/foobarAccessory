/*
Utils.js
(c) 2007 Chris Mrazek
*/

var LogSuccess = 0;
var LogError = 1;
var LogWarning = 2;
var LogInfo = 3;

function diag(msg)
{
	if (g_diagMode)
	{
		EventLog(LogInfo, "Diag: " + msg);
	}
}

function EventLog(type, msg)
{
	System.Diagnostics.EventLog.writeEntry("foobarAccessory:\n" + msg, type);
}

function EventLogEx(type, ex, msg)
{
    var text = "foobarAccessory:\n" + msg + "\n\nException Details:";
	if (ex.number != 0)
	{
		text += "\nError Number: " + String(ex.number);
	}
	if (ex.description != "")
	{
		text += "\nDescription: " + String(ex.description);
	}
	if (ex.name != "")
	{
		text += "\nName: " + String(ex.name);
	}
	
	System.Diagnostics.EventLog.writeEntry(text, type);
}

function Trim(text)
{
	var ret = String(text);
	
	while (ret.length > 0)
	{
		var ch = ret.substr(0, 1);
		if (ch == " " || ch == "\t" || ch == "\r" || ch == "\n") ret = ret.substr(1, ret.length - 1);
		else break;
	}
	
	while (ret.length > 0)
	{
		var ch = ret.substr(ret.length - 1, 1);
		if (ch == " " || ch == "\t" || ch == "\r" || ch == "\n") ret = ret.substr(0, ret.length - 1);
		else break;
	}
	
	return ret;
}
