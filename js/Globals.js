﻿/*
Globals.js
(c) 2007 Chris Mrazek
*/

var foobar = null;
var fso = new ActiveXObject("Scripting.FileSystemObject");
var shell = new ActiveXObject("WScript.Shell");

var setting_AutoArtworkDownload = false;
var setting_DownloadArtworkOnClick = true;
var setting_ClickArtworkReplaces = false;
var setting_ScrollTitles = true;

// Global variables
var g_diagMode = true;
var g_intervalID = null;
var g_gotArtwork = false;
var g_artworkLoc = "";
var g_noCacheID = 1;
var g_mouseX = 0;
var g_mouseY = 0;
var g_trackFieldsPopulated = false;
var g_periodicMode = PeriodicInactive;
var g_playButtonPlay = true;
var g_playButtonOver = false;
var g_nextButtonOver = false;
var g_prevButtonOver = false;
var g_buttonsActive = false;
var g_rating = 0;
var g_ratingVisible = false;
var g_ratingOver = false;
var g_ratingOverValue = 0;
var g_ratingAlt = "";
var g_queueArtwork = "";
var g_queueArtworkTrack = null;
var g_menuItems = new Array();
var g_menuStyles = new Array();
var g_soundVolumeEnabled = false;
var g_soundVolume = -1;
var g_volumeButtonOver = false;
var g_muteButtonOver = false;
var g_muteOn = false;
var g_volumeBeforeMute = 0;
var g_volumeHideTimer = null;
var g_artworkVisible = true;
var g_menuGrowBodyShow = 0;
var g_menuGrowBodyNormal = 0;
var g_editSaveFunc = null;
var g_editDelayTimer = null;
var g_menuScroll = 0;
var g_menuMaxScroll = 0;
var g_volumeSliderOrientation = "vertical";
var g_menuVisible = false;
var g_menuHeight = 0;
var g_waitingForFoobarShutdown = false;
var g_currentArtwork = "";
var g_theme = k_defaultTheme;
var g_themePath = System.Gadget.path + "\\Themes\\" + k_defaultTheme;
var g_dockedLayout = k_defaultDockedLayout;
var g_undockedLayout = k_defaultUndockedLayout;
var g_bodyWidth = 0;
var g_bodyHeight = 0;
var g_docked = false;
var g_titleScrollInterval = null;
var g_titleScrollDelta = 1;
var g_titleScrollWait = 0;
var g_artistScrollInterval = null;
var g_artistScrollDelta = 1;
var g_artistScrollWait = 0;
var g_albumScrollInterval = null;
var g_albumScrollDelta = 1;
var g_albumScrollWait = 0;

// Theme-specific image locations
var g_ratingNoneImage = "";
var g_ratingOffImage = "";
var g_ratingOnImage = "";
var g_ratingHoverImage = "";
var g_noArtworkImage = "";
var g_sliderHBackImage = "";
var g_sliderHForeImage = "";
var g_sliderVBackImage = "";
var g_sliderVForeImage = "";
var g_menuTextNormalColor = "";
var g_menuTextNormalFilter = "";
var g_menuTextHoverColor = "";
var g_menuTextHoverFilter = "";
var g_menuTextSelectColor = "";
var g_menuTextSelectFilter = "";
var g_playInactiveImage = "";
var g_playActiveImage = "";
var g_playActiveHoverImage = "";
var g_pauseInactiveImage = "";
var g_pauseActiveImage = "";
var g_pauseActiveHoverImage = "";
var g_prevInactiveImage = "";
var g_prevActiveImage = "";
var g_prevActiveHoverImage = "";
var g_nextInactiveImage = "";
var g_nextActiveImage = "";
var g_nextActiveHoverImage = "";
var g_menuActiveImage = "";
var g_menuActiveHoverImage = "";
var g_muteInactiveImage = "";
var g_muteOffActiveImage = "";
var g_muteOffActiveHoverImage = "";
var g_muteOnActiveImage = "";
var g_muteOnActiveHoverImage = "";
var g_volumeInactiveImage = "";
var g_volumeActiveImage = "";
var g_volumeActiveHoverImage = "";
var g_menuCloseActiveImage = "";
var g_menuCloseActiveHoverImage = "";
var g_menuSeparatorImage = "";

// Theme configuration tracking (used to hide controls that were not touched by the XML file)
var g_configTitle = false;
var g_configArtist = false;
var g_configAlbum = false;
var g_configRating0 = false;
var g_configRating1 = false;
var g_configRating2 = false;
var g_configRating3 = false;
var g_configRating4 = false;
var g_configRating5 = false;
var g_configArtwork = false;
var g_configTimePassed = false;
var g_configTimeRemain = false;
var g_configTimeSlider = false;
var g_configPlay = false;
var g_configPrev = false;
var g_configNext = false;
var g_configMenu = false;
var g_configVolume = false;
var g_configMute = false;
var g_configVolumeSlider = false;
var g_configMenuDialog = false;
