# Extract: Mercury-VesselView-403-Operation-8m0124182.pdf

Source: `manuals/electronics/Mercury-VesselView-403-Operation-8m0124182.pdf`

Vessel note: HIN BEYFT208F223 has **VesselView 403** (install sheet CONFIRMED). Prefer this ops manual for screens, setup wizard, alarms, USB software update.

Pages selected: 27 of 70

## PDF page 1

VesselView
403
OPERATION
MANUAL

## PDF page 2

© 2018 Mercury Marine VesselView 403
8M0124182  1217 eng

## PDF page 3



## PDF page 4

TABLE OF CONTENTS
Section 1 - Getting Started
Declaration of Conformity.......................................................... 2
Standard............................................................................... 2
Test Report...........................................................................2
VesselView Overview................................................................ 2
VesselView 403 Front Panel...................................................... 3
VesselView 403 Rear Panel...................................................... 4
Wiring Architecture..................................................................... 4
Device Maintenance.................................................................. 5
Display Screen Cleaning...................................................... 5
Media Port Cleaning............................................................. 5
Electrical connections...........................................................5
Section 2 - Initial Screens and Setup Wizard
Splash Screen............................................................................ 8
Setup Wizard............................................................................. 8
Overview............................................................................. 8
Import Configuration........................................................... 9
Engine Setup...................................................................... 9
Device Setup.................................................................... 11
Joystick Installed............................................................... 11
Speed Setup..................................................................... 11
Units Setup....................................................................... 14
Tank Setup....................................................................... 14
Active Trim Setup............................................................. 18
Finishing Setup Wizard..................................................... 19
Source Selection Notice................................................... 20
Creating Screen Captures....................................................... 20
Section 3 - Main Menu Selections
Overview.................................................................................. 24
Enlarging Data Screens........................................................... 24
Entering Text and Numbers..................................................... 25
Home....................................................................................... 25
Active Trim .............................................................................. 26
Introduction to Active Trim..................................................26
GPS.................................................................................... 27
Shallow Water Operation................................................... 27
Trailer Position and Active Trim......................................... 27
Trim Profiles Overview....................................................... 27
Setup and Configuration.................................................... 28
Fuel.......................................................................................... 30
Battery...................................................................................... 30
Speed....................................................................................... 30
Trim/Tabs................................................................................. 31
System..................................................................................... 31
Smart Tow................................................................................ 33
Trip........................................................................................... 35
Tanks....................................................................................... 36
Faults History........................................................................... 36
Troll.......................................................................................... 39
Performance............................................................................ 41
Depth....................................................................................... 41
Genset..................................................................................... 41
Maintenance............................................................................ 42
File Browser............................................................................. 43
Settings.................................................................................... 45
System............................................................................... 45
About............................................................................ 45
Helm............................................................................. 46
Wizard.......................................................................... 46
Restore......................................................................... 47
Network........................................................................ 47
Simulate........................................................................48
Time..............................................................................49
Check for Updates........................................................ 49
Vessel.................................................................................50
Tabs..............................................................................50
Tanks............................................................................ 50
Speed........................................................................... 51
Steering........................................................................ 51
Sea Temperature Source............................................. 52
Joystick Installed................................................................ 52
Engine................................................................................ 52
Number of Engines....................................................... 53
Engines Shown.............................................................53
Engine Model................................................................53
Limits............................................................................ 53
Supported Data............................................................ 53
Cruise/Smart Tow Type................................................ 53
Active Trim....................................................................53
Preferences........................................................................ 53
Key Beeps.................................................................... 53
Backlight....................................................................... 54
Pop‑ups........................................................................ 54
Units............................................................................. 54
Interface........................................................................54
Alarms................................................................................ 54
History.......................................................................... 54
Settings.........................................................................54
Siren Enabled............................................................... 56
Wireless..............................................................................56
Personality File................................................................... 56
90-8M0124182   eng  DECEMBER 2017 Page  i

## PDF page 5

Section 4 - Software Update Procedure
Checking the Current Software Version................................. 58
Downloading the Current Software......................................... 58
Updating through a Wi‑Fi Connection.................................... 58
Updating through the USB Port.............................................. 64
Page  ii 90-8M0124182   eng  DECEMBER 2017

## PDF page 6

Section 1 - Getting Started
Table of Contents
Declaration of Conformity....................................................... 2
Standard ......................................................................... 2
Test Report ..................................................................... 2
VesselView Overview............................................................. 2
VesselView 403 Front Panel.................................................. 3
VesselView 403 Rear Panel................................................... 4
Wiring Architecture................................................................. 4
Device Maintenance............................................................... 5
Display Screen Cleaning ................................................ 5
Media Port Cleaning ....................................................... 5
Electrical connections ..................................................... 5
1 
  
Section 1 - Getting Started
90-8M0124182   eng  DECEMBER 2017 Page  1

## PDF page 7

Declaration of Conformity
Mercury Marine declares that the following product to which this declaration relates is in conformity with the requirements of EU
directive 2014/30/EU (Electromagnetic Compatibility), and Section 182 of the Australian Radiocommunications
(Electromagnetic Compatibility) standard 2008, and satisfies all the technical regulations applicable.
The assessment has been carried out in accordance with Annex II of the above directive.
Product Mercury Marine VesselView 403
This product has been tested to the following standards.
Standard
Standard Description
EN 60945:2002
Clause 9 and 10
Maritime Navigation and Radiocommunication Equipment and Systems —
General Requirements — Methods of Testing and Required Test Results
Test Report
Laboratory Report Number
TÜV SÜD AMERICA INC. SD72119173‑0816 Rev.1
I, the undersigned, hereby declare that the equipment specified above conforms to the above Directives and standards for CE
marking for sale in the European and Australian communites.
Authorized Representative
Address Mercury Marine, W6250 Pioneer Road, P.O. Box 1939 Fond du Lac, WI 54936‑1939
Signature
John Pfeifer, President, Mercury Marine
Date 10/01/2017
The attention of the purchaser, installer, or user is drawn to special measures and limitations to use which must be observed
when the product is taken into service to maintain compliance with the above directives. Details of these special measures and
limitations to use are contained in the appropriate product manuals.
VesselView Overview
IMPORTANT:  VesselView is a multifunction display (MFD) that is compatible with products manufactured by Mercury Marine
Outboards, Mercury MerCruiser, Mercury Diesel. In addition, the VesselView software can be installed on compatible display
devices from Lowrance® and Simrad®. Some of the functions explained in this manual will be disabled depending on the
power package it is connected to.
VesselView is a comprehensive boat information center that can display information for up to two gasoline or diesel engines. It
continuously monitors and reports operating data including detailed information such as water temperature and depth, trim
status, boat speed and steering angle, and the status of fuel, oil, water, and waste tanks. VesselView can be fully integrated
with a vessel’s global positioning system (GPS) or other NMEA‑compatible devices to provide up‑to‑the‑minute navigation,
speed, and fuel‑to‑destination information. VesselView is a display extension for autopilot and joystick operations. All
functionality of these piloting features are controlled through Mercury Marine's autopilot control area network (CAN) pad or
joystick piloting control. VesselView will show if a mode of control is active or in standby; pop‑ups will appear as the vessel
arrives at waypoints, prompting response to turns. Additional display text can be used to adjust the engines and drives to
achieve maximum efficiency.
Display resolution 320 x 240 – H x W
Display type LED‑backlit optically bonded full‑color transflective TFT‑LCD
Display size 104 mm (4.1 in.)
Display viewing angle 170 degrees
Operating temperature –25 °C to 65 °C (–13 °F to 149 °F)
Operating temperature stored –40 °C to 85 °C (–40 °F to 185 °F)
Water resistance IPX7
Section 1 - Getting Started 
Page  2 90-8M0124182   eng  DECEMBER 2017

## PDF page 8

Product width 118 mm (4.64 in.)
Product depth 36.5 mm (1.43 in.)
Product height 115 mm (4.52 in.)
Product weight 0.32 kg (0.7 lb)
Power consumption 2.2 W (maximum)
Power supply NMEA 2000®
NMEA 2000 load equivalency number 4 network loads
VesselView 403 Front Panel
VesselView 403 utilizes five hard buttons with no touchscreen functionality.
Front controls
a - Menu button
b - Down arrow button
c - Enter button
d - Up arrow button
e - Speed control button
• The Menu button provides access to the Mercury menu features.
• The Down arrow button provides downward navigation of on‑screen options or selections.
• The Enter button is used to select, engage, disengage, or to save a selection.
• The Up arrow button provides upward navigation of on‑screen options or selections.
• The Speed control button provides access to speed control features of the VesselView.
64768abcde
Section 1 - Getting Started
90-8M0124182   eng  DECEMBER 2017 Page  3

## PDF page 9

VesselView 403 Rear Panel
The wiring connection points on the rear panel of the VesselView allow for the connection of the Mercury SmartCraft network
communication cable, and for the unit to communicate over a NMEA 2000 network. There is also an USB port for utilizing a
wi‑fi dongle, as well as for connecting a portable storage device for updating software, uploading vessel personalities, or
downloading screen captures.
Rear panel
a - Mercury SmartCraft connection
b - NMEA 2000 connection
c - USB port
Wiring Architecture
The following image depicts a typical wiring architecture for incorporating VesselView into a boat's communication network.
a - Optional connection to a chartplotter or multifunction display
b - 120 ohm termination resistor, male
c - 120 ohm termination resistor, female
d - NMEA® 2000 fused power source
e - Power bus
f - NMEA® 2000 T‑connector
g - VesselView 403
h - Weather capped—unused
i - Junction box
abc
64773
62802
ab c
de
f
ghi ENTER
Section 1 - Getting Started 
Page  4 90-8M0124182   eng  DECEMBER 2017

## PDF page 10

Device Maintenance
IMPORTANT: It is recommended that the supplied white plastic sun cover be installed for protection when the unit is not in
service.
Display Screen Cleaning
Routine cleaning of the display screen is recommended to prevent a buildup of salt and other environmental debris. Crystalized
salt can scratch the display coating when using a dry or damp cloth. Ensure that the cloth has a sufficient amount of fresh water
to dissolve and remove salt deposits. Do not apply aggressive pressure on the screen while cleaning. When water marks
cannot be removed with the cloth, mix a 50/50 solution of warm water and isopropyl alcohol to clean the screen. Do not use
acetone, mineral spirits, turpentine type solvents, or ammonia based cleaning products. The use of strong solvents or
detergents may damage the antiglare coating, the plastics, or the rubber keys. It is recommended that the sun cover be
installed when the unit is not in use to prevent UV damage to the plastic bezels and rubber keys.
Media Port Cleaning
The media port cap area should be cleaned on a regular basis to prevent a buildup of crystalized salt and other debris.
Electrical connections
Routine inspection of the electrical connections should be performed to prevent the buildup of crystalized salt and other debris.
Section 1 - Getting Started
90-8M0124182   eng  DECEMBER 2017 Page  5

## PDF page 11

Section 1 - Getting Started 
Notes:
Page  6 90-8M0124182   eng  DECEMBER 2017

## PDF page 12

Section 2 - Initial Screens and Setup Wizard
Table of Contents
Splash Screen........................................................................ 8
Setup Wizard.......................................................................... 8
Overview.......................................................................... 8
Import Configuration........................................................ 9
Engine Setup................................................................... 9
Device Setup................................................................. 11
Joystick Installed............................................................11
Speed Setup.................................................................. 11
Units Setup.................................................................... 14
Tank Setup.................................................................... 14
Active Trim Setup.......................................................... 18
Finishing Setup Wizard.................................................. 19
Source Selection Notice................................................ 20
Creating Screen Captures.................................................... 20
2 
  
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  7

## PDF page 13

Splash Screen
Upon startup, VesselView will display an initial splash screen. An image of an engine in the lower corner indicates that the
engine power on the vessel is emission controlled.
64808
Splash screen
Setup Wizard
Overview
The VesselView Setup Wizard guides you through the first steps of configuring the VesselView. The Setup Wizard can be
accessed at any time by pressing the Menu button. In the menu screen, use the Down Arrow button to navigate to the
Settings option. In the Settings menu, use the Down arrow to navigate to the System option and launch Wizard.
At the Welcome screen, press the Down arrow button to begin the Setup Wizard.
64813
Section 2 - Initial Screens and Setup Wizard 
Page  8 90-8M0124182   eng  DECEMBER 2017

## PDF page 14

Import Configuration
The setup wizard will begin by asking the operator if there is a configuration file that has been saved to the local storage in the
unit, or loaded on the USB storage device inserted into the back of the unit. This can be helpful and save setup time if the
settings and preferences to be used for this vessel are identical to a vessel which has already been used to create a
configuration file. If there is no file to import, press the Down arrow button to continue with the wizard. If there is a configuration
to import, use the file browser menu option to locate the configuration file. Refer to Section 3 ‑ File Browser.
65795
Engine Setup
In the engine setup section of the setup wizard, the operator can select the engine model, the number of engines on the vessel,
and the number of engines, up to two, which will be displayed on a particular VesselView.
NOTE: VesselView 403 will only display data for two engines. Vessels with three or more engines will require additional
VesselView 403 units.
Press the Enter button to bring up the selection of engines. Use the arrow buttons to navigate up and down the list. Press the
Enter button when the correct engine is highlighted.
64814
 64815
Engine selection
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  9

## PDF page 15

Press the Enter button to bring up the Number of Engines screen. Use the up and down arrow buttons to select the correct
number of engines on the vessel.
64816
 64817
Number of engines
Press the Enter button to bring up the Engines Shown selection screen. Depending on the number of engines selected in the
previous step, appropriate options will only be shown. For example, if three engines was selected, the operator would be given
the options of Port, Starboard, and Center. Use the arrow buttons to highlight an option and press the Enter button to activate
the check box of the engines that will be displayed on the VesselView. A maximum of two engines can be displayed on a single
VesselView 403.
When finished with the Engine Setup portion of the Wizard, press the Menu button to return to the Engine Setup screen. Press
the Down arrow button to continue to the next step of the Wizard.
64819
 64820
Engines shown
Section 2 - Initial Screens and Setup Wizard 
Page  10 90-8M0124182   eng  DECEMBER 2017

## PDF page 16

Device Setup
In the Device Setup screen, use the up and down arrow buttons and the Enter button to confirm selection. If using multiple
VesselView devices, be sure to assign unique numbers to each unit to avoid data transmission problems. Helm numbers
should match the location of the individual VesselView unit. It is common to make the main helm 1 and the secondary helm 2.
Press the Down arrow button to continue with the Wizard.
64823
 64824
Helm and device setup
Joystick Installed
For vessels equipped with Joystick Piloting, highlight and select the Joystick Installed check box option. This will ensure that
inputs to the system, initiated by the joystick, will be recognized by the VesselView unit.
65801
Speed Setup
The speed source determines how speed data is obtained. A strategy utilizes pitot and paddlewheel data to establish the
vessel's speed. When strategy is selected, the pitot and paddlewheel data source engine must be selected. GPS utilizes the
data coming from the GPS unit to determine speed. When GPS is selected, the proper network BUS must be selected as the
source of GPS data to the VesselView.
Use the Up arrow and Down arrow buttons and the Enter button to make selections in the Speed Setup screens.
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  11

## PDF page 17

Highlight and select the GPS Source.
64825
Speed source selection
For GPS speed data, select the CAN Bus that transmits the GPS data over the SmartCraft network.
65293
Highlight and select the Speed Source option.
65292
Section 2 - Initial Screens and Setup Wizard 
Page  12 90-8M0124182   eng  DECEMBER 2017

## PDF page 18

For a speed Strategy, highlight and select the Pitot source option and choose the engine PCM that will report the data from the
pitot sensor.
65294
64827
Engine position selection
Select the Paddle source option and choose the engine PCM that will report data from the paddlewheel sender.
65295
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  13

## PDF page 19

64827
Engine position selection
The PCM positions for vessels with multiple engines is shown in the following illustration.
a - PCM0 = starboard outer
b - PCM1 = port outer
c - PCM2 = starboard inner or center
d - PCM3 = port inner
When selections are completed in the Speed Setup portion of the Wizard, press the Down arrow button to continue to the next
step of the Wizard.
Units Setup
VesselView allows the operator to select the units of measure which are displayed. Use the Up Arrow and Down Arrow
buttons and the Enter button to make a selection.
64829
 64830
Units of measure to display
When selections are completed in the Units Setup, press the Down Arrow button to continue with the Wizard.
Tank Setup
IMPORTANT: Check that all tank sensors and senders are connected properly to the network before attempting to configure
new tanks.
Tank setup allows the operator to select the tank type, set the volume of the tank, and name the tank.
a a abb bc cd60056a
Section 2 - Initial Screens and Setup Wizard 
Page  14 90-8M0124182   eng  DECEMBER 2017

## PDF page 20

With Tanks highlighted, press the Enter button to continue.
65337
With the Configure new tank highlighted, press the Enter button.
65338
The tank configuration screen contains all of the information that VesselView will require to display accurate tank data.
Tank configuration screen
a - Detected tank sensor
b - Type of tank
c - The tank name
d - The tank capacity
e - Tank reading inversion
f - Tank calibration
g - Save option
NOTE: Selecting genset fuel as a tank type will not add the volume of the genset tank to the overall volume of the vessel
propulsion fuel tanks.
65339
abcdefg
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  15

## PDF page 21

To select the tank type, use the Up arrow and Down arrow buttons to highlight the desired tank type. With the tank type
selected, press the Enter button.
65340
Enter the name of the tank. Up to nine characters can be entered into the name field. Refer to Section 3 ‑ Entering Text and
Numbers. When finished entering the name of the tank, press the Menu button to continue to the next step.
65343
Enter the capacity of the tank. Use the same process used in the previous step to complete the entry. When finished entering
the capacity of the tank, press the Menu button to continue to the next step.
65345
Section 2 - Initial Screens and Setup Wizard 
Page  16 90-8M0124182   eng  DECEMBER 2017

## PDF page 22

VesselView gives the operator the ability to invert the volume value of the tanks being monitored. This option is available to
accommodate some tank senders that transmit data opposite of traditional standard senders. Standard tank level senders read
a 33–240 ohm resistance. A reading of 240 ohms indicating an empty tank and a reading of 33 ohms indicating a full tank.
Inverted tank senders typically read 0–180 ohms, with 0 ohms indicating a full tank and a reading of 180 ohms indicating an
empty tank.
65347
Performing tank calibration: There are many situations in which a tank may need calibration; odd shaped tanks, V‑bottomed
tanks, stepped‑sided tanks, and even a tank's aspect when the boat is in the water. Floats and senders can send inaccurate
data to the operator, causing problems with fuel and other volume display. The most accurate way to achieve tank calibration is
to start with an empty tank with a known capacity. Pump one quarter of the capacity and record the float or sender position.
Repeat this procedure in one quarter increments, recording the float or sensor position each time, until the tank is full. Tank
calibration allows the operator to adjust the full through empty readings of a tank.
Use the Up arrow and Down arrow buttons to highlight the calibration rows. With a row highlighted, press the Enter button to
change the percentage data. Press the Menu button to exit the calibration row.
65348
When all fields and selections have been configured, highlight the Save option and press the Enter button to save the tank
settings into the VesselView.
65349
Section 2 - Initial Screens and Setup Wizard
90-8M0124182   eng  DECEMBER 2017 Page  17

## PDF page 66

If no wireless hotspots are detected, select the Rescan option to begin a fresh query of available hotspot options in the area.
65265
After a hotspot is selected, the operator will need to set the Authentication Mode to OPEN, and enter the Network Key or
password if the hotspot connection is secured to complete the connection.
65257
Highlight and check the Connect automatically option.
65259
Section 4 - Software Update Procedure
90-8M0124182   eng  DECEMBER 2017 Page  61

## PDF page 67

Highlight and select the Connect option by pressing the Enter button.
65260
The screen will display the connecting to data at the top. It may take up to a minute to establish the connection.
65261
When the wireless connection has been established the screen will display the connected information at the top.
65262
In the System setting screen is the Check for updates option. Use the Down arrow to highlight Check for updates and press
the Enter button to query the internet for current software files.
Section 4 - Software Update Procedure 
Page  62 90-8M0124182   eng  DECEMBER 2017

## PDF page 68

IMPORTANT: Ensure that the wi‑fi dongle is inserted into the VesselView unit and a hotspot is accessible.
65264
If a newer version of the operating software is found, VesselView will prompt the operator to download the file or to ignore the
update.
65686
After selecting the Download option, the downloading screen will appear informing the operator that the file is in the process of
being transferred to the VesselView.
65688
Section 4 - Software Update Procedure
90-8M0124182   eng  DECEMBER 2017 Page  63

## PDF page 69

When the update download is complete, the operator will be informed that the file is ready to be installed. The operator can
highlight and select the Restart Now option to install the update immediately, or highlight and select the Cancel option and
install the update at a later time by going to the File Browser menu and locating the file.
65689
Updating through the USB Port
1. Download the current software release from the Mercury website. Copy the file to a USB drive with sufficient space.
2. Turn the ignition key on and verify that the VesselView is on. Wait for a complete startup of the VesselView.
3. Insert the USB drive into the VesselView card port all the way.
4. Push the Menu button on the VesselView unit to bring up the main Menu screen.
5. Press the Up arrow or Down arrow buttons to navigate to the File Browser option.
64935
6. Select USB Storage from the options shown.
64936
7. Select the update file that was loaded onto the USB drive. With the desired file highlighted, press the Enter button.
Section 4 - Software Update Procedure 
Page  64 90-8M0124182   eng  DECEMBER 2017

## PDF page 70

NOTE: The following image is for illustrative purposes. The actual name of the update file will vary.
64937
8. VesselView will give the operator a prompt and an advisory screen. Do not power the unit off during the update process.
Wait for the progress bar to show completion of the update.
9. A prompt to remove the USB device will appear when the update is ready to finish.
Section 4 - Software Update Procedure
90-8M0124182   eng  DECEMBER 2017 Page  65
