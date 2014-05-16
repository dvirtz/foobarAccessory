/*
Constants.js
(c) 2007 Chris Mrazek
*/

var k_activePeriodicTime = 1000;
var k_inactivePeriodicTime = 10000;
var k_suspendedPeriodicTime = 5000;
var k_volumeAutoHideTime = 5000;
var k_editDelayTime = 1000;
var k_textScrollTime = 250;				// number of milliseconds between title scroll intervals
var k_textScrollSpeed = 4;				// number of pixels to scroll the title on each interval
var k_textScrollInitialWait = 5000;		// number of milliseconds to wait before scrolling the title
var k_textScrollNegativeWait = 3000;	// number of milliseconds to wait before scrolling the title backwards
var k_menuHeaderHeight = 12;
var k_menuItemHeight = 12;
var k_defaultTheme = "Dark";
var k_defaultDockedLayout = "Normal";
var k_defaultUndockedLayout = "Wide";
var k_themesDir = System.Gadget.path + "\\Themes";

var k_DisplayModeNormal = "Normal";
var k_DisplayModeNoArtwork = "NoArtwork";
var k_DisplayModeWide = "Wide";
var k_DisplayModeBareBones = "BareBones";
var k_DisplayModeSuperThin = "SuperThin";

var ITArtworkFormatUnknown = 0;
var ITArtworkFormatJPEG = 1;
var ITArtworkFormatPNG = 2;
var ITArtworkFormatBMP = 3;

var ITPlayButtonStatePlayDisabled = 0;
var ITPlayButtonStatePlayEnabled = 1;
var ITPlayButtonStatePauseEnabled = 2;
var ITPlayButtonStatePauseDisabled = 3;
var ITPlayButtonStateStopEnabled = 4;
var ITPlayButtonStateStopDisabled = 5;

var ITPlayerStatePlaying = 1;

var PeriodicInactive = 0;
var PeriodicActive = 1;
var PeriodicSuspended = 2;

var ITSourceKindAudioCD = 3;
var ITSourceKindDevice = 5;
var ITSourceKindIPod = 2;
var ITSourceKindLibrary = 1;
var ITSourceKindMP3CD = 4;
var ITSourceKindRadioTuner = 6;
var ITSourceKindSharedLibrary = 7;
var ITSourceKindUnknown = 0;
