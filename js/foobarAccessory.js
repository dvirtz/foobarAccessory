/*
foobarAccessory.js
(c) 2011 Dvir Yitzchaki
(c) 2007 Chris Mrazek
*/

function LoadSettings()
{
	var value;
	
	value = System.Gadget.Settings.readString("AutoArtworkDownload");
	if (value != "") setting_AutoArtworkDownload = value == "True";
	else setting_AutoArtworkDownload = false;
	
	value = System.Gadget.Settings.readString("DownloadArtworkOnClick");
	if (value != "") setting_DownloadArtworkOnClick = value == "True";
	else setting_DownloadArtworkOnClick = true;
	
	value = System.Gadget.Settings.readString("ClickArtworkReplaces");
	if (value != "") setting_ClickArtworkReplaces = value == "True";
	else setting_ClickArtworkReplaces = false;
	
	value = System.Gadget.Settings.readString("ScrollTitles");
	if (value != "") setting_ScrollTitles = value == "True";
	else setting_ScrollTitles = true;
	
	// Theme
	g_theme = String(System.Gadget.Settings.readString("Theme"));
	g_dockedLayout = String(System.Gadget.Settings.readString("DockedLayout"));
	g_undockedLayout = String(System.Gadget.Settings.readString("UndockedLayout"));
	if (g_theme == "" || g_dockedLayout == "" || g_undockedLayout == "")
	{
		g_theme = k_defaultTheme;
		g_dockedLayout = k_defaultDockedLayout;
		g_undockedLayout = k_defaultUndockedLayout;
	}
	g_themePath = System.Gadget.path + "\\Themes\\" + g_theme;
	
	UpdateLayout();
}

function SettingsClosed()
{
	if (g_menuVisible) CloseMenu();
	LoadSettings();
}

function OnBodyLoad()
{
	try
	{
		ClearTrackFields();
		
		System.Gadget.settingsUI = "Settings.html";
		System.Gadget.onSettingsClosed = SettingsClosed;
		System.Gadget.onDock = OnDockChange;
		System.Gadget.onUndock = OnDockChange;
		LoadSettings();
		
		SetPeriodic(PeriodicInactive);
		InactivePeriodic();
		
		document.onmousemove = OnMouseMove;
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception during initialization.");
	}
}

function OnDockChange()
{
	UpdateLayout();
}

function ActivePeriodic()
{
	try
	{
		Periodic();
		if (foobar != null)
		{
			UpdateTrackInfo(false);
		}
	}
	catch(ex)
	{
		if (ex.number != -2147418111)	// foobar throws this when closing
		{
			EventLogEx(LogWarning, ex, "Abnormal exception in Active Periodic.");
		}
		
		try
		{
			foobar = null;
			OnfoobarClosed();

			SetPeriodic(PeriodicSuspended);
		}
		catch(ex2)
		{
			EventLogEx(LogError, ex2, "Exception in ActivePeriodic when attempting to switch to inactive.");
		}
	}
}

function InactivePeriodic()
{
	try
	{
		Periodic();
		if (foobarIsRunning())
		{
			if (!g_waitingForFoobarShutdown)
			{
				try
				{
				    foobar = new ActiveXObject("Foobar2000.Application.0.7")
				}
				catch(ex)
				{
					foobar = null;
				}

				if (foobar != null)
				{
					OnfoobarStart();
					SetPeriodic(PeriodicActive);
				}
			}
		}
		else
		{
			if (g_waitingForFoobarShutdown)
			{
				g_waitingForFoobarShutdown = false;
			}
			
			if (g_periodicMode == PeriodicSuspended)
			{
				SetPeriodic(PeriodicInactive);
			}

			if (g_trackFieldsPopulated)
			{
				ClearTrackFields();
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogWarning, ex, "Exception in InactivePeriodic.");
	}
}

function Periodic()
{
	// This periodic runs regardless of being active or inactive
	try
	{
//		if (g_queueArtwork != "")
//		{
//			g_queueArtworkTrack.AddArtworkFromFile(g_queueArtwork);
//			
//			g_queueArtwork = "";
//			g_queueArtworkTrack = null;
//		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception in a periodic.");
	}
}

function SetPeriodic(mode)
{
	if (g_intervalID != null)
	{	
		window.clearInterval(g_intervalID);
		g_intervalID = null;
	}
	
	if (mode == PeriodicInactive)
	{
		g_intervalID = window.setInterval(InactivePeriodic, k_inactivePeriodicTime);
	}
	else if (mode == PeriodicActive)
	{
		g_intervalID = window.setInterval(ActivePeriodic, k_activePeriodicTime);
	}
	else if (mode == PeriodicSuspended)
	{
		g_intervalID = window.setInterval(InactivePeriodic, k_suspendedPeriodicTime);
	}
	else
	{
		EventLog(LogError, "Unknown periodic mode [" + String(mode) + "] specified.");
	}
	
	g_periodicMode = mode;
}

function foobarIsRunning()
{
	var procs = GetObject("WinMgmts:").InstancesOf("Win32_Process");
	var procEnum = new Enumerator(procs);
	for ( ; !procEnum.atEnd(); procEnum.moveNext())
	{
		var proc = procEnum.item();   
		if (proc.Name == "foobar2000.exe")
		{
			return true;
		}
	}
	return false;
}

function MoveElement(element, left, top, width, height)
{
	if (left != null) element.style.left = Number(left);
	if (top != null) element.style.top = Number(top);
	if (width != null) element.style.width = Number(width);
	if (height != null) element.style.height = Number(height);
}

function HideElement(element)
{
	element.style.visibility = "hidden";
	MoveElement(element, 0, 0, 0, 0);
}

function ShowElement(element, left, top, width, height)
{
	element.style.visibility = "visible";
	MoveElement(element, left, top, width, height);
}

function PositionElement(element, left, top)
{
	element.style.left = Number(left);
	element.style.top = Number(top);
}

function UpdateTrackInfo(forceUpdate)
{
	var fullUpdateRequired = false;
	var trackHasChanged = false;

	var currentTrack = foobar.playback;
	if (currentTrack != null)
	{
		var trackTitle  = Trim(currentTrack.FormatTitle("%title%"));
		var trackArtist = Trim(currentTrack.FormatTitle("%artist%"));
		var trackAlbum  = Trim(currentTrack.FormatTitle("%album%"));
		var trackYear = Trim(currentTrack.FormatTitle("%date%"));
		var trackGenre = Trim(currentTrack.FormatTitle("%genre%"));
		var trackPath   = Trim(currentTrack.FormatTitle("%path%"));
		
		if (Trim(divTitle.innerText) != trackTitle ||
			Trim(divArtist.innerText) != trackArtist ||
			Trim(divAlbum.innerText) != trackAlbum)
		{
			trackHasChanged = true;
		}

		if (forceUpdate || trackHasChanged)
		{
			fullUpdateRequired = true;
		}
		
		if (g_artworkVisible &&
			(fullUpdateRequired || (!g_gotArtwork)))
		{
			fullUpdateRequired = true;

			var saveFilePathName = "";
			var jpegposition = trackPath.lastIndexOf("\\");
            var trackFolder = trackPath.substr(0, jpegposition);
			saveFilePathName = trackFolder + "/folder.jpg";
			if (fso.FileExists(saveFilePathName)) {
			    DisplayArtwork(saveFilePathName);
			}
			else {
			    saveFilePathName = "";
			    var folder = fso.GetFolder(trackFolder);
			    var filesEnum = new Enumerator(folder.files);
                for (filesEnum.moveFirst(); !filesEnum.atEnd(); filesEnum.moveNext())
                {
                    var file = filesEnum.item();
                    var extpos = file.name.lastIndexOf(".");
                    if (extpos != -1)
                    {
                        var ext = file.name.substr(extpos);
                        if (ext == ".jpg")
                        {
                            saveFilePathName = file.path;
                            DisplayArtwork(saveFilePathName);
                            break;
                        }
                    }
                } 
                if (saveFilePathName == "")
			    {
                    DisplayArtwork("");
                }
			}
			
			var artworkText = "";
			if (trackArtist != "")
			{
			    artworkText += trackArtist;
			}
			if (trackAlbum != "")
			{
				if (artworkText != "") artworkText += "\n";
				artworkText += trackAlbum;
			}
            if (trackYear != 0)
			{
				if (artworkText != "") artworkText += "\n";
				artworkText += "Year: " + String(trackYear);
			}
			if (trackGenre != "")
			{
				if (artworkText != "") artworkText += "\n";
				artworkText += "Genre: " + trackGenre;
			}
			
			if (trackArtist != "" &&
				trackAlbum != "" &&
				(setting_ClickArtworkReplaces || !g_gotArtwork))
			{
				artworkText += "\n\nClick here to download artwork from Amazon.com";
			}
			artwork.alt = artworkText;
		}
		
		if (fullUpdateRequired)
		{
			try
			{
				divTitle.filters.item("DXImageTransform.Microsoft.Fade").apply();
				divArtist.filters.item("DXImageTransform.Microsoft.Fade").apply();
				divAlbum.filters.item("DXImageTransform.Microsoft.Fade").apply();
			}
			catch(ex)
			{
			}
			
			if (trackTitle == "") divTitle.innerText = " ";
			else divTitle.innerText = trackTitle;
			divTitle.title = "Title: " + trackTitle;
			if (editTitle.style.visibility == "visible")
			{
				editTitle.value = trackTitle;
				editTitle.select();
			}
			
			if (trackArtist == "") divArtist.innerText = " ";
			else divArtist.innerText = trackArtist;
			divArtist.title = "Artist: " + trackArtist;
			if (editArtist.style.visibility == "visible")
			{
				editArtist.value = trackArtist;
				editArtist.select();
			}
			
			if (trackAlbum == "") divAlbum.innerText = " ";
			else divAlbum.innerText = trackAlbum;
			divAlbum.title = "Album: " + trackAlbum;
			if (editAlbum.style.visibility == "visible")
			{
				editAlbum.value = trackAlbum;
				editAlbum.select();
			}
			
			try
			{
				divTitle.filters.item("DXImageTransform.Microsoft.Fade").play();
				divArtist.filters.item("DXImageTransform.Microsoft.Fade").play();
				divAlbum.filters.item("DXImageTransform.Microsoft.Fade").play();
			}
			catch(ex)
			{
			}
			
			UpdateTextIntervals();

			g_rating = Number(currentTrack.FormatTitle("%rating%"));
			g_ratingVisible = true;
			g_ratingAlt = "Rating: " + String(g_rating);
			UpdateRating();
		}
		
		var position = Number(currentTrack.Position);
		var duration = Number(currentTrack.length);
		if (position > duration) position = duration;
		if (position < 0) position = 0;
		if (duration <= 0)
		{
			if (timePassed.style.visibility == "visible")
			{
				timePassed.innerText = "";
				timePassed.title = "";
			}
			
			if (timeRemain.style.visibility == "visible")
			{
				timeRemain.innerText = "";
				timeRemain.title = "";
			}
			
			if (timerBack.style.visibility == "visible")
			{
				timerFront.style.visibility = "hidden";
				timerFront.alt = "";
				timerBack.alt = "";
			}
		}
		else
		{
			if (timePassed.style.visibility == "visible")
			{
				timePassed.innerText = FormatTime(position);
				timePassed.title = "Time Passed: " + timePassed.innerText;
			}
			
			if (timeRemain.style.visibility == "visible")
			{
				var remain = duration - position;
				timeRemain.innerText = FormatTime(remain);
				timeRemain.title = "Time Remaining: " + timeRemain.innerText;
			}
			
			if (timerBack.style.visibility == "visible")
			{
				var durationText = "Duration: " + FormatTime(duration);
				timerFront.alt = durationText;
				timerBack.alt = durationText;
				
				timerFront.style.width = String(Math.round(position / duration * timerBack.offsetWidth)) + "px";
				timerFront.style.visibility = "visible";
			}
		}

		g_trackFieldsPopulated = true;
	}
	else
	{
		// currentTrack is null
		if (g_trackFieldsPopulated)
		{
			ClearTrackFields();
		}
	}

    g_playButtonPlay = !foobar.playback.isPlaying || foobar.playback.isPaused;
	UpdatePlayButton();
	
	if (setting_AutoArtworkDownload &&
		trackHasChanged &&
		!g_gotArtwork)
	{
		DoArtworkDownload();
	}
	
	// Volume state
	UpdateVolume();
}

function ClearTrackFields()
{
	divTitle.innerHTML = "";
	divTitle.title = "";
	divArtist.innerText = "";
	divArtist.title = "";
	divAlbum.innerText = "";
	divAlbum.title = "";
	
	UpdateTextIntervals();
	
	timerFront.style.width = "1px";
	timerFront.style.visibility = "hidden";
	timerFront.alt = "";
	timerBack.alt = "";
	timePassed.innerText = "";
	timePassed.title = "";
	timeRemain.innerText = "";
	timeRemain.title = "";
	
	g_ratingVisible = false;
	g_ratingAlt = "";
	UpdateRating();
	
	ChangeArtwork(g_noArtworkImage);
	artwork.alt = "";

	g_trackFieldsPopulated = false;
	g_lastTrackID = -1;
	g_playButtonPlay = true;
}

function OnfoobarStart()
{
	g_buttonsActive = true;
	UpdateButtons();
	UpdateTrackInfo(true);
}

function OnfoobarClosed()
{
	g_buttonsActive = false;
	UpdateButtons();
}

function SetRating(userRating)
{
//	try
//	{
//		if (foobar != null)
//		{
//			var currentTrack = foobar.CurrentTrack;
//			if (currentTrack != null)
//			{
//				currentTrack.Rating = userRating;
//				UpdateTrackInfo(true);
//			}
//		}
//	}
//	catch(ex)
//	{
//		EventLogEx(LogError, ex, "Exception when attempting to set track rating.");
//	}
}

function NextTrack()
{
	try
	{
		if (foobar != null)
		{
		    foobar.playback.Next();
			UpdateTrackInfo(true);
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when attempting to jump to next track.");
	}
}

function PrevTrack()
{
	try
	{
		if (foobar != null)
		{
		    foobar.playback.Previous();
			UpdateTrackInfo(true);
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when attempting to jump to previous track.");
	}
}

function PlayPause()
{
	try
	{
		if (foobar != null) {
		    if (foobar.playback.IsPlaying)
		        foobar.playback.Pause();
            else
		        foobar.playback.Start(false);
			UpdateTrackInfo(true);
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when attempting to play/pause.");
	}
}

function TimerClick()
{
	try
	{
		var leftSide = Number(timerBack.offsetLeft + timerBack.offsetParent.offsetLeft);
		var rightSide = leftSide + timerBack.offsetWidth;
		var width = Number(timerBack.offsetWidth);
		if (width > 0)
		{
			if (foobar != null && g_mouseX >= leftSide && g_mouseX <= rightSide)
			{
				var currentTrack = foobar.playback;
				if (currentTrack != null)
				{
				    var duration = Number(currentTrack.Length);
					if (duration > 0)
					{
						var newPosition = Math.round((g_mouseX - leftSide) / width * duration);

						foobar.playback.Seek(newPosition);
						UpdateTrackInfo(false);
					}
				}
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on timer.");
	}
}

function OnMouseMove(e)
{
	g_mouseX = event.clientX;
	g_mouseY = event.clientY;
}


function UpdateButtons()
{
	UpdatePrevButton();
	UpdatePlayButton();
	UpdateNextButton();
	UpdateVolumeButtons();
}

function UpdatePlayButton()
{
	if (g_buttonsActive)
	{
		if (g_playButtonOver)
		{
			if (g_playButtonPlay) playButton.src = g_playActiveHoverImage;
			else playButton.src = g_pauseActiveHoverImage;
		}
		else
		{
			if (g_playButtonPlay) playButton.src = g_playActiveImage;
			else playButton.src = g_pauseActiveImage;
		}
	}
	else
	{
		if (g_playButtonPlay) playButton.src = g_playInactiveImage;
		else playButton.src = g_pauseInactiveImage;
	}
	
	if (g_playButtonPlay) playButton.alt = "Play";
	else playButton.alt = "Pause";
}

function UpdateNextButton()
{
	if (g_buttonsActive)
	{
		if (g_nextButtonOver) nextButton.src = g_nextActiveHoverImage;
		else nextButton.src = g_nextActiveImage;
	}
	else
	{
		nextButton.src = g_nextInactiveImage;
	}
}

function UpdatePrevButton()
{
	if (g_buttonsActive)
	{
		if (g_prevButtonOver) prevButton.src = g_prevActiveHoverImage;
		else prevButton.src = g_prevActiveImage;
	}
	else
	{
		prevButton.src = g_prevInactiveImage;
	}
}

function UpdateVolumeButtons()
{
	if (g_buttonsActive)
	{
		if (g_volumeButtonOver) volumeButton.src = g_volumeActiveHoverImage;
		else volumeButton.src = g_volumeActiveImage;
		
		if (g_muteOn)
		{
			if (g_muteButtonOver) muteButton.src = g_muteOnActiveHoverImage;
			else muteButton.src = g_muteOnActiveImage;
		}
		else
		{
			if (g_muteButtonOver) muteButton.src = g_muteOffActiveHoverImage;
			else muteButton.src = g_muteOffActiveImage;
		}
	}
	else
	{
		volumeButton.src = g_volumeInactiveImage;
		muteButton.src = g_muteInactiveImage;
	}
}

function UpdateRating()
{
	if (g_ratingVisible)
	{
		if (g_ratingOver)
		{
			rating1.src = g_ratingOverValue >= 20 ? g_ratingHoverImage : (g_rating >= 20 ? g_ratingOnImage : g_ratingOffImage);
			rating2.src = g_ratingOverValue >= 40 ? g_ratingHoverImage : (g_rating >= 40 ? g_ratingOnImage : g_ratingOffImage);
			rating3.src = g_ratingOverValue >= 60 ? g_ratingHoverImage : (g_rating >= 60 ? g_ratingOnImage : g_ratingOffImage);
			rating4.src = g_ratingOverValue >= 80 ? g_ratingHoverImage : (g_rating >= 80 ? g_ratingOnImage : g_ratingOffImage);
			rating5.src = g_ratingOverValue >= 100 ? g_ratingHoverImage : (g_rating >= 100 ? g_ratingOnImage : g_ratingOffImage);
		}
		else
		{
			rating1.src = g_rating >= 20 ? g_ratingOnImage : g_ratingOffImage;
			rating2.src = g_rating >= 40 ? g_ratingOnImage : g_ratingOffImage;
			rating3.src = g_rating >= 60 ? g_ratingOnImage : g_ratingOffImage;
			rating4.src = g_rating >= 80 ? g_ratingOnImage : g_ratingOffImage;
			rating5.src = g_rating >= 100 ? g_ratingOnImage : g_ratingOffImage;
		}
	}
	else
	{
		rating1.src = g_ratingNoneImage;
		rating2.src = g_ratingNoneImage;
		rating3.src = g_ratingNoneImage;
		rating4.src = g_ratingNoneImage;
		rating5.src = g_ratingNoneImage;
	}
	
	rating0.src = g_ratingNoneImage;	// This is always invisible
	
	rating1.alt = g_ratingAlt;
	rating2.alt = g_ratingAlt;
	rating3.alt = g_ratingAlt;
	rating4.alt = g_ratingAlt;
	rating5.alt = g_ratingAlt;
}

function UpdateStaticButtons()
{
	menuButton.src = g_menuActiveImage;
	menuCloseButton.src = g_menuCloseActiveImage;
}

function OnPrevMouseOver(over)
{
	g_prevButtonOver = over;
	UpdatePrevButton();
}

function OnPlayMouseOver(over)
{
	g_playButtonOver = over;
	UpdatePlayButton();
}

function OnNextMouseOver(over)
{
	g_nextButtonOver = over;
	UpdateNextButton();
}

function OnRatingMouseOver(rating, over)
{
	g_ratingOverValue = rating;
	g_ratingOver = over;
	UpdateRating();
}

function OnMuteMouseOver(over)
{
	g_muteButtonOver = over;
	UpdateVolumeButtons();
}

function OnVolumeMouseOver(over)
{
	g_volumeButtonOver = over;
	UpdateVolumeButtons();
}

//function OnDropArtwork()
//{
//	try
//	{
//		if (foobar == null || foobar.CurrentTrack == null) return;
//		
//		var fileLoc = String(System.Shell.itemFromFileDrop(event.dataTransfer, 0).path);
//		if (fileLoc != "")
//		{
//			var lastDotIndex = fileLoc.lastIndexOf(".");
//			if (lastDotIndex < 0) return;
//			
//			var ext = fileLoc.substr(lastDotIndex, fileLoc.length - lastDotIndex).toLowerCase();
//			if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".bmp") return;
//			
//			// Firefox doesn't populate the file until after this function has returned,
//			// so queue it up for the next periodic.
//			g_queueArtwork = fileLoc;
//			g_queueArtworkTrack = foobar.CurrentTrack;
//		}
//	}
//	catch(ex)
//	{
//		EventLogEx(LogError, ex, "Exception during drop operation.");
//	}
//}

function FormatTime(duration)
{
	var text = String(Math.floor(duration / 60)) + ":";
	var seconds = Math.floor(duration % 60);
	if (seconds < 10) text += "0";
	text += String(seconds);
	
	return text;
}

function RunFoobar(arg) {
    var shell = new ActiveXObject("WScript.Shell");
    var command = "\"" + foobar.ApplicationPath + "\" " + arg;
    shell.Run(command);
}

function QuitfoobarClick()
{
	try
	{
		if (foobar != null) {
		    RunFoobar("/exit");
			foobar = null;
			g_waitingForFoobarShutdown = true;
			
			OnfoobarClosed();
			ClearTrackFields();
			
			SetPeriodic(PeriodicInactive);
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when trying to quit foobar.");
	}
}

function StartfoobarClick()
{
	try
	{
		if (foobar == null)
		{
			g_waitingForFoobarShutdown = false;
			foobar = new ActiveXObject("Foobar2000.Application.0.7")
			OnfoobarStart();
			SetPeriodic(PeriodicActive);
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when trying to start foobar.");
		
		foobar = null;
		OnfoobarClosed();
		ClearTrackFields();
		SetPeriodic(PeriodicInactive);
	}
}

function ShowMainMenu()
{
	try
	{
		ClearMenu();
		
		if (foobar != null)
		{
			AddMenuItem("Choose Playlist", "BuildPlaylistMenu();");
//			AddMenuItem("Choose EQ", "BuildEQMenu();");
			AddMenuSeparator();
			AddMenuItem("Choose Playing Order", "BuildPlayingOrderMenu();");
			
//			if (foobar.CurrentTrack != null)
//			{
//				AddMenuItem("Track Rating", "RatingMenu();");
//			}
			
//			if (currentPlaylist != null || foobar.CurrentTrack != null)
//			{
				AddMenuSeparator();
//			}
			
			AddMenuItem("Show foobar", "ShowfoobarClick();");
			AddMenuItem("Quit foobar", "QuitfoobarClick();");
		}
		else
		{
			AddMenuItem("Open foobar", "StartfoobarClick();");
		}
		
		SetMenuTitle("Menu");
		ShowMenu();
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when menu button clicked.");
	}
}

function BuildPlayingOrderMenu() {
	try
	{
		if (foobar != null)
		{			
            var orderEnum = new Enumerator(foobar.playback.settings.PlaybackOrders);

            for (orderEnum.moveFirst(); !orderEnum.atEnd(); orderEnum.moveNext()) {
                var order = orderEnum.item();
                if (order != null) {
                    AddMenuItem(order, "ToggleShuffle(\"" + order + "\");").selected = 
                        foobar.playback.settings.ActivePlaybackOrder == order;
                }
            }
			
            SetMenuTitle("Playing order");
			ShowMenu();
        }
    }
    catch (ex) {
        EventLogEx(LogError, ex, "Exception when building playing order menu.");
    }
}

function BuildPlaylistMenu()
{
	try
	{
		if (foobar != null)
		{
			var currentPlaylist = foobar.Playlists.ActivePlaylist;

			ClearMenu();

			var playlistEnum = new Enumerator(foobar.Playlists);

			for (playlistEnum.moveFirst(); !playlistEnum.atEnd(); playlistEnum.moveNext()) {
			    var playlist = playlistEnum.item();
			    if (playlist != null) {
			        var selected = false;
			        if (playlist == currentPlaylist) {
			            selected = true;
			        }

			        var name = "Library\\";
			        name += playlist.Name;

			        var item = AddMenuItem(name, "PlaylistClick(" + playlist + ");");
			        item.selected = selected;
			    }
			}
			
			SetMenuTitle("Playlists");
			ShowMenu();
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when building playlist menu.");
	}
}

function PlaylistClick(playlist)
{
	try
	{
		if (foobar != null)
		{
			if (playlist == null)
			{
			    EventLog(LogError, "null playlist\n");
				return;
			}

			foobar.Playlists.ActivePlaylist = playlist;
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on a playlist.");
	}
}

//function BuildEQMenu()
//{
//	try
//	{
//		if (foobar != null)
//		{
//			ClearMenu();
//			
//			var currentName = "";
//			if (foobar.CurrentEQPreset != null)
//			{
//				currentName = String(foobar.CurrentEQPreset.Name);
//			}
//			
//			for (var eqIndex = 1; eqIndex <= foobar.EQPresets.Count; eqIndex++)
//			{
//				var eq = foobar.EQPresets.Item(eqIndex);
//				var item = AddMenuItem(eq.Name, "ApplyEQ('" + eq.Name + "');");
//				if (eq.Name == currentName)
//				{
//					item.selected = true;
//				}
//			}
//			
//			SetMenuTitle("EQ Presets");
//			ShowMenu();
//		}
//	}
//	catch(ex)
//	{
//		EventLogEx(LogError, ex, "Exception when building EQ menu.");
//	}
//}

//function ApplyEQ(name)
//{
//	try
//	{
//		if (foobar != null)
//		{
//			for (var eqIndex = 1; eqIndex <= foobar.EQPresets.Count; eqIndex++)
//			{
//				var eq = foobar.EQPresets.Item(eqIndex);
//				if (eq.Name == name)
//				{
//					foobar.CurrentEQPreset = eq;
//					break;
//				}
//			}
//		}
//	}
//	catch(ex)
//	{
//		EventLogEx(LogError, ex, "Exception when applying EQ.");
//	}
//}

function HtmlEscape(text)
{
	var s = String(text);
	
	s = s.replace("&", "&amp;");
	s = s.replace("<", "&lt;");
	s = s.replace(">", "&gt;");
	s = s.replace("\"", "&quot;");
	
	return s;
}

function MuteClick()
{
	try
	{
		if (foobar != null) {
		    if (isMuteOn())
		        foobar.playback.Settings.Volume = g_volumeBeforeMute;
		    else {
		        g_volumeBeforeMute = foobar.playback.Settings.Volume;
		        foobar.playback.Settings.Volume = -100;
		    }
		    g_muteOn = isMuteOn();
			UpdateVolumeButtons();
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when mute button clicked.");
	}
}

function VolumeClick()
{
	try
	{
		if (volumeBack.style.visibility == "hidden")
		{
			volumeBack.style.visibility = "visible";
			volumeFront.style.visibility = "visible";
			g_volumeHideTimer = window.setTimeout("VolumeAutoHide();", k_volumeAutoHideTime);
			if (foobar != null)
			{
				UpdateVolume();
			}
		}
		else
		{
			volumeBack.style.visibility = "hidden";
			volumeFront.style.visibility = "hidden";
			if (g_volumeHideTimer != null)
			{
				window.clearTimeout(g_volumeHideTimer);
				g_volumeHideTimer = null;
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when volume button clicked.");
	}
}

function VolumeAutoHide()
{
	try
	{
		volumeBack.style.visibility = "hidden";
		volumeFront.style.visibility = "hidden";
		if (g_volumeHideTimer != null)
		{
			window.clearTimeout(g_volumeHideTimer);
			g_volumeHideTimer = null;
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when attempting to auto-hide the volume slider.");
	}
}

function VolumeSliderClick()
{
	try
	{
		if (foobar != null)
		{
			var clickX = event.clientX - volumeBack.offsetLeft - volumeBack.clientLeft;
			var clickY = event.clientY - volumeBack.offsetTop - volumeBack.clientTop;
			
			var volume;
			if (g_volumeSliderOrientation == "vertical")
			{
				volume = Math.round((volumeBack.clientHeight - clickY) / volumeBack.clientHeight * 100);
			}
			else
			{
				volume = Math.round(clickX / volumeBack.offsetWidth * 100);
			}
			
			if (volume < 0) volume = 0;
			if (volume > 100) volume = 100;
			
			foobar.playback.Settings.Volume = volume - 100;
			
			if (g_volumeHideTimer != null)
			{
				window.clearTimeout(g_volumeHideTimer);
				g_volumeHideTimer = window.setTimeout("VolumeAutoHide();", k_volumeAutoHideTime);
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when volume slider was clicked.");
	}
}

function AdjustVolume(delta)
{
	if (foobar == null) return;

	var volume = foobar.playback.settings.volume + delta;
	if (volume < -100) volume = -100;
	if (volume > 0) volume = 0;

	foobar.playback.settings.volume = volume;
	
	if (g_volumeHideTimer != null)
	{
		window.clearTimeout(g_volumeHideTimer);
		g_volumeHideTimer = window.setTimeout("VolumeAutoHide();", k_volumeAutoHideTime);
	}
}

function UpdateVolume()
{
	if (volumeBack.style.visibility == "visible")
	{
		if (Number(foobar.playback.settings.volume) + 100 != g_soundVolume)
		{
		    g_soundVolume = Number(foobar.playback.settings.volume) + 100;
			
			if (g_volumeSliderOrientation == "vertical")
			{
				var range = volumeBack.clientHeight;
				var volumePos = Math.round(g_soundVolume / 100 * range);
				if (volumePos < 0) volumePos = 0;
				if (volumePos > range) volumePos = range;
				
				volumeFront.style.left = volumeBack.offsetLeft + volumeBack.offsetParent.offsetLeft;
				volumeFront.style.top = volumeBack.offsetTop + volumeBack.offsetParent.offsetLeft + range - volumePos;
				volumeFront.style.width = volumeBack.clientWidth;
				volumeFront.style.height = volumePos;
			}
			else
			{
				var range = volumeBack.clientWidth;
				var volumePos = Math.round(g_soundVolume / 100 * range);
				if (volumePos < 0) volumePos = 0;
				if (volumePos > range) volumePos = range;
				
				volumeFront.style.left = volumeBack.offsetLeft + volumeBack.offsetParent.offsetLeft;
				volumeFront.style.top = volumeBack.offsetTop + volumeBack.offsetParent.offsetLeft;
				volumeFront.style.width = volumePos;
				volumeFront.style.height = volumeBack.clientHeight;
			}
		}
	}

    if (isMuteOn() != g_muteOn)
	{
	    g_muteOn = isMuteOn() ? true : false;
		UpdateVolumeButtons();
	}
}

function isMuteOn() {
    return foobar.playback.settings.volume == -100;
}

function ToggleShuffle(order)
{
	try
	{
		if (foobar != null)
		{
		    foobar.playback.settings.ActivePlaybackOrder = order;
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when toggling shuffle mode.");
	}
}

function TitleClick()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
	}
	g_editDelayTimer = window.setTimeout("TitleEdit();", k_editDelayTime);
}

function TitleMouseOut()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
		g_editDelayTimer = null;
	}
}

function TitleEdit()
{
	try
	{
		if (foobar != null)
		{
			var currentTrack = foobar.playback;
			if (currentTrack != null)
			{
			    ShowEditField(editTitle, currentTrack.FormatTitle("%title%"), TitleSave);
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on title.");
	}
}

function SetTag(field, value) {
    RunFoobar("/tag:" + field + "=\"" + value + "\" \"" + foobar.playback.formatTitle("%path%") + "\"");
}

function TitleSave(value)
{
	if (foobar != null)
	{
		var currentTrack = foobar.playback;
		if (currentTrack != null)
		{
			if (VerifyTrackTitle(value))
			{
			    SetTag("title", value);
			}
		}
	}
}

function VerifyTrackTitle(trackTitle)
{
//	var title = String(trackTitle);
//	
//	for (var index = 0; index < title.length; index++)
//	{
//		var ch = title.charAt(index);
//		if (ch <= " " || ch > "~")
//		{
//		    return false;
//		}
//	}
	
	return true;
}

function ArtistClick()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
	}
	g_editDelayTimer = window.setTimeout("ArtistEdit();", k_editDelayTime);
}

function ArtistMouseOut()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
		g_editDelayTimer = null;
	}
}

function ArtistEdit()
{
	try
	{
        if (foobar != null) {
	        var currentTrack = foobar.playback;
	        if (currentTrack != null) {
	            ShowEditField(editTitle, currentTrack.FormatTitle("%artist%"), ArtistSave);
	        }
	    }
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on title.");
	}
}

function ArtistSave(value)
{
	if (foobar != null)
	{
		var currentTrack = foobar.playback;
		if (currentTrack != null) {
		    SetTag("artist", value);
		}
	}
}

function AlbumClick()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
	}
	g_editDelayTimer = window.setTimeout("AlbumEdit();", k_editDelayTime);
}

function AlbumMouseOut()
{
	if (g_editDelayTimer != null)
	{
		window.clearTimeout(g_editDelayTimer);
		g_editDelayTimer = null;
	}
}

function AlbumEdit()
{
	try {
	    if (foobar != null) {
	        var currentTrack = foobar.playback;
	        if (currentTrack != null) {
	            ShowEditField(editTitle, currentTrack.FormatTitle("%album%"), AlbumSave);
	        }
	    }
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user clicked on title.");
	}
}

function AlbumSave(value)
{
	if (foobar != null)
	{
		var currentTrack = foobar.playback;
		if (currentTrack != null) {
		    SetTag("album", value);
		}
	}
}

function ShowEditField(control, defaultValue, saveFunc)
{
	editTitle.style.visibility = "hidden";
	editArtist.style.visibility = "hidden";
	editAlbum.style.visibility = "hidden";
	
	control.value = defaultValue;
	control.style.visibility = "visible";
	control.focus();
	control.select();
	
	g_editSaveFunc = saveFunc;
}

function EditFieldKeyDown(control)
{
	try
	{
		if (event.keyCode == 13)		// Enter
		{
			ExitEditField(control, true);
		}
		else if (event.keyCode == 27)	// Escape
		{
			ExitEditField(control, false)
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when user pressed a key in edit field.");
	}
}

function ExitEditField(control, save)
{
	try
	{
		control.style.visibility = "hidden";
		
		if (save)
		{
			g_editSaveFunc(control.value);
		}
		g_editSaveFunc = null;
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when attempting to exit edit field.\nSave: " + save);
	}
}

//function RatingMenu()
//{
//	try
//	{
//		if (foobar != null && foobar.CurrentTrack != null)
//		{
//			var rating = Number(foobar.CurrentTrack.Rating);
//			
//			AddMenuItem("(Unrated)", "SetRating(0);").selected = rating == 0;
//			AddRawMenuItem("<span class='rating'>&#171;</span>", "SetRating(20);").selected = rating > 0 && rating < 40;
//			AddRawMenuItem("<span class='rating'>&#171;&#171;</span>", "SetRating(40);").selected = rating >= 40 && rating < 60;
//			AddRawMenuItem("<span class='rating'>&#171;&#171;&#171;</span>", "SetRating(60);").selected = rating >= 60 && rating < 80;
//			AddRawMenuItem("<span class='rating'>&#171;&#171;&#171;&#171;</span>", "SetRating(80);").selected = rating >= 80 && rating < 100;
//			AddRawMenuItem("<span class='rating'>&#171;&#171;&#171;&#171;&#171;</span>", "SetRating(100);").selected = rating >= 100;
//			
//			ShowMenu();
//		}
//	}
//	catch(ex)
//	{
//		EventLogEx(LogError, ex, "Exception when displaying rating menu.");
//	}
//}

function ShowfoobarClick()
{
    try {
        RunFoobar("/show");
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Error when attempting to show foobar.");
	}
}

function MenuButton_MouseOver(over)
{
	if (over)
	{
		menuButton.src = g_menuActiveHoverImage;
	}
	else
	{
		menuButton.src = g_menuActiveImage;
	}
}

function MenuCloseButton_MouseOver(over)
{
	if (over)
	{
		menuCloseButton.src = g_menuCloseActiveHoverImage;
	}
	else
	{
		menuCloseButton.src = g_menuCloseActiveImage;
	}
}

function UpdateTextIntervals()
{
	// Title
	if (setting_ScrollTitles && divTitle.offsetWidth > divTitleContainer.clientWidth)
	{
		if (g_titleScrollInterval != null) window.clearInterval(g_titleScrollInterval);
		g_titleScrollInterval = window.setInterval(ScrollTitlePeriodic, k_textScrollTime);
		g_titleScrollDelta = 1;
		g_titleScrollWait = k_textScrollInitialWait / k_textScrollTime;
	}
	else if (g_titleScrollInterval != null)
	{
		window.clearInterval(g_titleScrollInterval);
		g_titleScrollInterval = null;
		g_titleScrollDelta = 0;
	}
	
	divTitleContainer.scrollLeft = 0;
	
	// Artist
	if (setting_ScrollTitles && divArtist.offsetWidth > divArtistContainer.clientWidth)
	{
		if (g_artistScrollInterval != null) window.clearInterval(g_artistScrollInterval);
		g_artistScrollInterval = window.setInterval(ScrollArtistPeriodic, k_textScrollTime);
		g_artistScrollDelta = 1;
		g_artistScrollWait = k_textScrollInitialWait / k_textScrollTime;
	}
	else if (g_artistScrollInterval != null)
	{
		window.clearInterval(g_artistScrollInterval);
		g_artistScrollInterval = null;
		g_artistScrollDelta = 0;
	}
	
	divArtistContainer.scrollLeft = 0;
	
	// Album
	if (setting_ScrollTitles && divAlbum.offsetWidth > divAlbumContainer.clientWidth)
	{
		if (g_albumScrollInterval != null) window.clearInterval(g_albumScrollInterval);
		g_albumScrollInterval = window.setInterval(ScrollAlbumPeriodic, k_textScrollTime);
		g_albumScrollDelta = 1;
		g_albumScrollWait = k_textScrollInitialWait / k_textScrollTime;
	}
	else if (g_albumScrollInterval != null)
	{
		window.clearInterval(g_albumScrollInterval);
		g_albumScrollInterval = null;
		g_albumScrollDelta = 0;
	}
	
	divAlbumContainer.scrollLeft = 0;
}

function ScrollTitlePeriodic()
{
	try
	{
		if (g_titleScrollWait > 0)
		{
			g_titleScrollWait--;
		}
		else
		{
			if (g_titleScrollDelta > 0)
			{
				var newScroll = divTitleContainer.scrollLeft + k_textScrollSpeed;
				if (newScroll > divTitle.offsetWidth - divTitleContainer.clientWidth)
				{
					g_titleScrollDelta = -1;
					divTitleContainer.scrollLeft = divTitle.offsetWidth;
					g_titleScrollWait = k_textScrollNegativeWait / k_textScrollTime;
				}
				else
				{
					divTitleContainer.scrollLeft = newScroll;
				}
			}
			else if (g_titleScrollDelta < 0)
			{
				var newScroll = divTitleContainer.scrollLeft - k_textScrollSpeed;
				if (newScroll < 0)
				{
					g_titleScrollDelta = 1;
					divTitleContainer.scrollLeft = 0;
					g_titleScrollWait = k_textScrollInitialWait / k_textScrollTime;
				}
				else
				{
					divTitleContainer.scrollLeft = newScroll;
				}
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception in title scroll periodic.");
	}
}

function ScrollArtistPeriodic()
{
	try
	{
		if (g_artistScrollWait > 0)
		{
			g_artistScrollWait--;
		}
		else
		{
			if (g_artistScrollDelta > 0)
			{
				var newScroll = divArtistContainer.scrollLeft + k_textScrollSpeed;
				if (newScroll > divArtist.offsetWidth - divArtistContainer.clientWidth)
				{
					g_artistScrollDelta = -1;
					divArtistContainer.scrollLeft = divArtist.offsetWidth;
					g_artistScrollWait = k_textScrollNegativeWait / k_textScrollTime;
				}
				else
				{
					divArtistContainer.scrollLeft = newScroll;
				}
			}
			else if (g_artistScrollDelta < 0)
			{
				var newScroll = divArtistContainer.scrollLeft - k_textScrollSpeed;
				if (newScroll < 0)
				{
					g_artistScrollDelta = 1;
					divArtistContainer.scrollLeft = 0;
					g_artistScrollWait = k_textScrollInitialWait / k_textScrollTime;
				}
				else
				{
					divArtistContainer.scrollLeft = newScroll;
				}
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception in artist scroll periodic.");
	}
}

function ScrollAlbumPeriodic()
{
	try
	{
		if (g_albumScrollWait > 0)
		{
			g_albumScrollWait--;
		}
		else
		{
			if (g_albumScrollDelta > 0)
			{
				var newScroll = divAlbumContainer.scrollLeft + k_textScrollSpeed;
				if (newScroll > divAlbum.offsetWidth - divAlbumContainer.clientWidth)
				{
					g_albumScrollDelta = -1;
					divAlbumContainer.scrollLeft = divAlbum.offsetWidth;
					g_albumScrollWait = k_textScrollNegativeWait / k_textScrollTime;
				}
				else
				{
					divAlbumContainer.scrollLeft = newScroll;
				}
			}
			else if (g_albumScrollDelta < 0)
			{
				var newScroll = divAlbumContainer.scrollLeft - k_textScrollSpeed;
				if (newScroll < 0)
				{
					g_albumScrollDelta = 1;
					divAlbumContainer.scrollLeft = 0;
					g_albumScrollWait = k_textScrollInitialWait / k_textScrollTime;
				}
				else
				{
					divAlbumContainer.scrollLeft = newScroll;
				}
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception in album scroll periodic.");
	}
}

function Body_MouseWheel()
{
	try
	{
		if (!g_menuVisible && volumeBack.style.visibility == "visible")
		{
			if (event.wheelDelta > 0)
			{
				AdjustVolume(5);
				UpdateVolume();
			}
			else if (event.wheelDelta < 0)
			{
				AdjustVolume(-5);
				UpdateVolume();
			}
		}
	}
	catch(ex)
	{
		EventLogEx(LogError, ex, "Exception when mouse wheel scrolled.");
	}
}
