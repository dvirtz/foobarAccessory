/*
Artwork.js
(c) 2011 Dvir Yitzchaki
(c) 2007 Chris Mrazek
*/

function ArtworkClick()
{
	try
	{
	    if (foobar != null && foobar.playback != null)
		{
			if (setting_DownloadArtworkOnClick)
			{
				if (setting_ClickArtworkReplaces || !g_gotArtwork)
				{
					DoArtworkDownload();
				}
				else if (g_gotArtwork)
				{
					ExpandCurrentArtwork();
				}
			}
			else if (g_gotArtwork)
			{
				ExpandCurrentArtwork();
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on artwork.");
	}
}

function ExpandCurrentArtwork()
{
	if (g_gotArtwork && g_artworkLoc != "")
	{
		var item = System.Shell.itemFromPath(g_artworkLoc);
		if (item != null)
		{
			item.invokeVerb();
		}
	}
}

function DoArtworkDownload()
{
    if (foobar == null) return false;

    var currentTrack = foobar.playback;
	if (currentTrack == null) return false;

	var artist = String(currentTrack.formatTitle("%artist%"));
	var album = String(currentTrack.formatTitle("%album%"));
	if (artist == "" || album == "") return false;
	
	var imageUrl = GetAlbumImageUrl(artist, album);
	if (imageUrl == "") return false;
	
}

function GetAlbumImageUrl(artist, album) {
    var query = artist + " " + album;
    google_make_request(query, SaveImageFromUrl, null);
}

function SaveImageFromUrl(req)
{
    var urls = google_get_urls(req);
    if (urls.length == 0) {
        return "";
    }
    
    var url = urls[0][1];
    var req;
	
	try
	{
		req = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
		req.Open("GET", url, false);
		req.Send();
	}
	catch(ex)
	{
		EventLogEx(LogWarning, ex, "Failed to download image.\nImage URL: " + url);
		return "";
	}
	
	try
	{
		var contentType = req.GetResponseHeader("Content-Type");
		if (contentType == "image/jpeg" || contentType == "image/jpg")
		{
			saveFilePathName = String(System.Gadget.path) + "\\DownloadedArtwork.jpg";
		}
		else if (contentType == "image/png")
		{
			saveFilePathName = String(System.Gadget.path) + "\\DownloadedArtwork.png";
		}
		else if (contentType == "image/bmp")
		{
			saveFilePathName = String(System.Gadget.path) + "\\DownloadedArtwork.bmp";
		}
		
		if (saveFilePathName == "")
		{
			EventLog(LogWarning, "Unrecognized content-type for artwork: " + contentType);
			return "";
		}
		
		// Can't use File.Write() because it craps out on the binary data
		var file = fso.CreateTextFile(saveFilePathName, true);
		
		var	rs = new ActiveXObject("ADODB.Recordset");
		rs.Fields.Append(0,201,req.ResponseText.length);	// 201 = longvarchar

		rs.Open();
		rs.AddNew();
		rs.Fields(0).AppendChunk(req.ResponseBody);
		
		var	data = new String(rs.Fields(0));
		rs.Close();
		
		file.Write(data);
		file.Close();
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Failed to save artwork to file.\nImage URL: " + url + "\nFile: " + saveFilePathName);
		return "";
	}

    currentTrack.AddArtworkFromFile(fileLoc);
    DisplayArtwork(fileLoc);
    UpdateTrackInfo(true);
}

function DisplayArtwork(fileLoc)
{
	if (fileLoc != "")
	{
		ChangeArtwork(fileLoc + "?" + g_noCacheID);
		g_noCacheID++;
		g_gotArtwork = true;
		g_artworkLoc = fileLoc;
	}
	else
	{
		ChangeArtwork(g_noArtworkImage);
		g_gotArtwork = false;
		g_artworkLoc = "";
	}
}

function ChangeArtwork(src)
{
	if (g_currentArtwork == src) return;
	g_currentArtwork = src;
	
	try
	{
		artwork.filters.item("DXImageTransform.Microsoft.Fade").apply();
		artwork.src = src;
		artwork.filters.item("DXImageTransform.Microsoft.Fade").play();
	}
	catch(ex)
	{
		artwork.src = src;
	}
}
