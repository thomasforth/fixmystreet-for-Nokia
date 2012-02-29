// Please don't remove line below - it is used for code-completion for Visual Studio
/// <reference path="preview\vsdoc.js" />

///////////////////////////////////////////////////////////////////////////////
// Simple "Hello World" widget that demonstrates the WRTKit UI toolkit.

// Reference to the WRTKit user interface manager and main view.
var uiManager;
var mainView;
var version = '1.00';
var picpath;

// Reference to controls in the main view.
var helloButton;
var nameField;

//about view label control
var aboutLabel;

// Called from the onload event handler to initialize the widget.
function init() {
    if (checkAPI() == true) {
    }
    else {
        alert('This application requires the APIBridge component from Nokia. This will now be downloaded and only needs to be installed once. Please install it and relaunch to continue');
        widget.openURL('http://www.tomforth.co.uk/moodstocks/apibridgedownloadhelper.php?file=APIBridge_v1_1.sis');
    }
    //create about menu
    var aboutMenuItem = new MenuItem("About", 0);
    aboutMenuItem.onSelect = menuItemSelected;
    menu.append(aboutMenuItem);
    //create checkforupdate menu item
    var updateMenuitem = new MenuItem("Check for Update", 3);
    updateMenuitem.onSelect = menuItemSelected;
    menu.append(updateMenuitem);
    //create help menu item
    var helpMenuitem = new MenuItem("Help", 2);
    helpMenuitem.onSelect = menuItemSelected;
    menu.append(helpMenuitem);    

    // set tab-navigation mode and show softkeys
    // (only if we are in the WRT environment)
    if (window.widget) {
        widget.setNavigationEnabled(false);
        menu.showSoftkeys();
    }

    // create UI manager
    uiManager = new UIManager();

    // create main view
    mainView = new ListView(null, null);
    describeyourselfButton = new NavigationButton(null, 'smiley.png', '1. Describe Yourself');
    describeyourselfButton.addEventListener("ActionPerformed", insertPersonalDescription);
    nameField = new TextField('name', 'Name <small><em>(Required)</em></small>', null, false);
    nameField.addEventListener("ValueChanged", saveDetails);
    emailAddress = new TextField(null, 'Email Address <small><em>(Required)</em></small>', null, false);
    emailAddress.addEventListener("ValueChanged", saveDetails);
    phoneNumber = new TextField(null, 'Phone Number <small><em>(Optional)</em></small>', null, false);
    phoneNumber.addEventListener("ValueChanged", saveDetails);
    describeproblemButton = new NavigationButton(null, 'roadworks.png', '2. Describe the Problem<br /><small>(Details can be updated later online)</small>');
    describeproblemButton.addEventListener("ActionPerformed", insertProblemDescription);
    problemSubject = new TextField('problemsubject', 'Subject', null, false);
    problemDescription = new TextArea(null, 'Description of the problem', null, false);
    locationLookupButton = new NavigationButton(null, 'lookup.png', "3. Lookup the Location <small><br />(optional)</small>");
    locationLookupButton.addEventListener("ActionPerformed", returnLocation);
    longitudeField = new TextField('longfield', 'Longitude', null, false);
    latitudeField = new TextField(null, 'Latitude', null, false);
    googlemap = new ContentPanel(null, 'Map of Reported Location', null, true, true);
    takePictureButton = new NavigationButton(null, 'camera.png', '4. Take a Picture');    
    takePictureButton.addEventListener("ActionPerformed", takePhoto);
    imageHolder = new ContentPanel(null, null, null, true, false);
    imagePath = new TextField('imgpath', 'Image Path', null, false);
    submitButton = new NavigationButton(null, 'upload.png', '5. Submit the Report');
    submitButton.addEventListener("ActionPerformed", newpostReport);
    formTest = new ContentPanel(null, null, null, true, true);
    mainView.addControl(describeyourselfButton);
    mainView.addControl(describeproblemButton);
    mainView.addControl(locationLookupButton);
    mainView.addControl(takePictureButton);
    mainView.addControl(imageHolder);
    mainView.addControl(submitButton);

    mainView.addControl(formTest);
    
    //Create about view
    aboutView = new ListView(null, null);
    // About lable control
    //aboutLabel = new Label();
    //aboutView.addControl(aboutLabel);

    // display the main view
         
    uiManager.setView(mainView);
    resizeFunction();
}

function resizeFunction() {
    if (window.innerHeight < 300) { //non-touch blackberry style device s60v3
        document.styleSheets[0].disabled = true;
        document.styleSheets[1].disabled = false;
    }
    else {
        document.styleSheets[0].disabled = false;
        document.styleSheets[1].disabled = true;
    }    
}

function saveDetails() {
    var name = nameField.getText();
    var email = emailAddress.getText();
    var phone = phoneNumber.getText();
    if (widget.preferenceForKey("name") == undefined) {
        widget.setPreferenceForKey("", "name");
        widget.setPreferenceForKey("", "email");
        widget.setPreferenceForKey("", "phone");
    }
    else {
        widget.setPreferenceForKey(name, "name");
        widget.setPreferenceForKey(email, "email");
        widget.setPreferenceForKey(phone, "phone");
    }
}

function newpostReport() {
    if (clickFix() == 'clickedOnce') { //horrible hack to fix a problem in s60v3
        return null;
    }
    
    uiManager.showNotification(-1, "wait", "Uploading Report...", -1);

    var parameters = {
                    "service" : "Nokia WRT app",
                    "subject" : problemSubject.getText(),
                    "detail" : problemDescription.getText(),
                    "name" : nameField.getText(),
                    "email" : emailAddress.getText(),
                    "phone" : phoneNumber.getText(),
                    "lat" : latitudeField.getText(),
                    "lon" : longitudeField.getText(),
                    }
    
    //parameters = '?service=Nokia WRT app&subject='+problemSubject.getText()+'&detail='+problemDescription.getText()+'&name='+nameField.getText()+'&email='+emailAddress.getText()+'&phone='+phoneNumber.getText()+'&lat='+latitudeField.getText()+'&lon='+longitudeField.getText();
    //alert(parameters);
    
    var postURL = 'http://www.fixmystreet.com/import';
    
    //alert(postURL);
    var file = imagePath.getText();

    APIBridge.fileUpload(
	    'photo',
	    file,
	    postURL,
	    parameters,
	    function(res) {
	        alert("RESPONSE: " + res.status + ";" + res.statusText + ";" + res.responseText);
	        uiManager.showNotification(500, "info", "Done!", null);
	    },
	    function(res) {
	        alert("ERROR: " + res.status + ";" + res.statusText);
	    }
    );
}

function insertPersonalDescription() {   
    // add a way to close the description if the button is pressed again when its already open
    if (clickFix() == 'clickedOnce') { //horrible hack to fix a problem in s60v3
        return null;
    }
    controls = mainView.getControls();
    alreadyOpenFlag = 'false';
    for (var i in controls) {
        if(controls[i].id == 'name') {
            alreadyOpenFlag = 'true';         
        }        
    }
    if (alreadyOpenFlag == 'true') {
        hideAllContent();
    }
    else {
        hideAllContent();
        mainView.insertControl(phoneNumber, describeproblemButton);
        mainView.insertControl(emailAddress, phoneNumber);
        mainView.insertControl(nameField, emailAddress);
        if (widget.preferenceForKey("name").length > 0) {
            nameField.setText(widget.preferenceForKey("name"));
        }
        if (widget.preferenceForKey("email").length > 0) {
            emailAddress.setText(widget.preferenceForKey("email"));
        }
        if (widget.preferenceForKey("phone").length > 0) {
            phoneNumber.setText(widget.preferenceForKey("phone"));
        }
    }
}

function insertProblemDescription() {
    // add a way to close the description if the button is pressed again when its already open
    if (clickFix() == 'clickedOnce') { //horrible hack to fix a problem in s60v3
        return null;
    }    
    controls = mainView.getControls();
    alreadyOpenFlag = 'false';
    for (var i in controls) {
        if(controls[i].id == 'problemsubject') {
            alreadyOpenFlag = 'true';         
        }        
    }
    if (alreadyOpenFlag == 'true') {
        hideAllContent();
    }
    else {
        hideAllContent();
        mainView.insertControl(problemDescription, locationLookupButton);
        mainView.insertControl(problemSubject, problemDescription);
    }
}

function useLocation(longitude,latitude) {    
    uiManager.showNotification(250, "wait", "Done!", null);
    
    // Display the location
    if (latitude == longitude == undefined) {
        alert("Location Lookup Unsuccessful");
    }
    else if (latitude == longitude == NaN) {
        alert("Location Lookup Unsuccessful");
    }
    else {
        mainView.insertControl(longitudeField, takePictureButton);
        mainView.insertControl(latitudeField, longitudeField);
        longitudeField.setText(longitude);
        latitudeField.setText(latitude);
        googlemap.setContent('<img width="100%" src="http://maps.google.com/maps/api/staticmap?center=' + latitude + ',' + longitude + '&zoom=15&size=360x360&markers=color:red|' + latitude + ',' + longitude + '&sensor=false">');
        //googlemap.setCaption('Map of reported Location');
        //googlemap.setFoldable(true);
        googlemap.setExpanded(true);
        mainView.insertControl(googlemap, takePictureButton);
        locationLookupButton.setImage('http://maps.google.com/maps/api/staticmap?center=' + latitude + ',' + longitude + '&zoom=13&size=90x90&markers=color:red|' + latitude + ',' + longitude + '&sensor=false');
        //locationLookupButton.setImage('cross.png');
        //locationButton.updateStyleFromState();
    }
}

// Show main view.
function showMainView() {

    // set right softkey to "exit"
    if (window.widget) {
        menu.setRightSoftkeyLabel("", null);
    }

    // show the main view
    uiManager.setView(mainView);
}
// Callback for when menu items are selected.
function menuItemSelected(id) {
    switch (id) {
        case 0:
            showAboutView();
            break;
        case 2:
            showHelpView();
            break;
        case 3:
            checkForUpdate();
            break;
    }
}

function showHelpView() {
    helpView = new ListView(null, null);
    helpcontent = '<p>The software works together with the fixmystreet people at mysociety.org</p>\
                   <p>It should help you report problems to your local UK council, so don\'t try it outside of the UK.</p>\
                   <p>Just fill out your details, describe the problem and take a picture. Optionally include your location to save you time later and then upload your report. Don\'t worry you\'ll get a chance to get check everything before it goes to your council.</p>\
                   <p>Within a few minutes you\'ll get an email with a link to the fixmystreet site where you can check and change your report before submitting it for real.</p>\
                   <p>Thanks for helping</p>';                    
   
    helpContentPanel = new ContentPanel(null, null, helpcontent, false, true);
    helpView.addControl(helpContentPanel);
    
    setAboutViewSoftkeys();
    uiManager.setView(helpView);
}

function checkForUpdate() {
    try {
        dateObject = new Date();
        updateAjax = new Ajax();
        updateAjax.onreadystatechange = updateCallback;
        updateAjax.open("GET", 'http://www.tomforth.co.uk/fixmystreet/updatehandler.php?' + dateObject.getMilliseconds(), true); //the milliseconds bit is useless but stops the browser caching the request
        updateAjax.send(null);
    }
    catch (err) { //there's a strange thing in the wrt. If you don't allow a network connection very quickly, it doesn't work. This tries again and fixes that problem
        uiManager.showNotification(500, "wait", "Sorry, I can't connect. Please check that you are connected to the internet and try again", null);
    }
}

function updateCallback() {    
    if (updateAjax.readyState != 4) {
    }
    if (updateAjax.readyState == 4) {
        webversion = updateAjax.responseText;
        if (version == webversion) {
            alert('Your version is ' + version + '\nThe most up-to-date version is ' + webversion + '\nNo update is available.');
        }
        else {
            alert('Your version is ' + version + '\nThe most up-to-date version is ' + webversion + '\nAn update is available on Ovi Store. See www.tomforth.co.uk/fixmystreet for download or more details.');
        }
    } 
} 

// Displays the About view
function showAboutView() {
    aboutcontent = '<p>Developed by Thomas Forth.</p>\
                   <p>See www.tomforth.co.uk/fixmystreet for more info, updates and contact details.</p>\
                   <p>This app is only possible because of the people at mysociety.org and their fixmystreet initiative.</p>\
                   <p>Please contact me if you have any feedback, bug reports or even just for a chat. I\'m quite friendly.</p>\
                   <p>Oh and don\'t blame me if this app crashes your phone or does anything bad, just uninstall it.\
                   I\'ve tested it as best I can but I\'m only one guy so don\'t sue me or anything daft like that.</p>\
                   <p>Finally, thanks for trying my app. I like building things but it\'s so much cooler when other people use them. Thank you!</p>\
                   <p>Tom</p>\
                   <p>This Widget includes software licensed from Nokia &copy 2008</p>';   
    aboutContentPanel = new ContentPanel(null, null, aboutcontent, false, true);
    aboutView.addControl(aboutContentPanel);
    
    setAboutViewSoftkeys();
    uiManager.setView(aboutView);
}

// Sets the soft keys for about view.
function setAboutViewSoftkeys() {
    if (window.widget) {
        // set right soft key to "Ok" (returns to main view)
        menu.setRightSoftkeyLabel("Ok", showMainView);
    }
}

function hideAllContent() {
    // this removes the controls from the mainView, it doesn't delete them.
    mainView.removeControl(phoneNumber);
    mainView.removeControl(emailAddress);
    mainView.removeControl(nameField);
    mainView.removeControl(problemDescription);
    mainView.removeControl(problemSubject);
    mainView.removeControl(longitudeField);
    mainView.removeControl(latitudeField);
    mainView.removeControl(googlemap);
    mainView.removeControl(imagePath);
    mainView.removeControl(imageHolder);
}

var lastClickTime = null;

function clickFix() {
    // There's an incredibly annoying bug in the s60v3 implementation of wrtKit and WRT that needs fixing
    // The problem is that the navikey fires an event twice for a single click.
    // I know what you're thinking, surely it's a keyUp and a keyDown fire? Nope
    // Since I don't know how to fix it I'm going to implement this hack, it's horrible.
    clickTimer = new Date();
    clickTime = clickTimer.getTime();
    if (Math.abs(lastClickTime - clickTime) < 100) {
        clickCount = 'clickedOnce';
    }
    else {
        clickCount = 'clickedTwice';
    }
    lastClickTime = clickTime;
    return clickCount;
}