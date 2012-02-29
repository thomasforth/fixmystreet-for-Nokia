function returnLocation() {
    if (clickFix() == 'clickedOnce') { //horrible hack to fix a problem in s60v3
        return null;
    }
    if (locationLookupButton.getImage().search(/lookup.png/) != -1) { //displays a loading gif if the location isn't already defined
        locationLookupButton.setImage('loading.gif');
    }
    // add a way to close the description if the button is pressed again when its already open
    controls = mainView.getControls();
    alreadyOpenFlag = 'false';
    for (var i in controls) {
        if(controls[i].id == 'longfield') {
            alreadyOpenFlag = 'true';         
        }        
    }
    if (alreadyOpenFlag == 'true') {
        hideAllContent();
    }
    else {
        hideAllContent();
        returnLocationasync();
    }
    //returnLocationsync();
}

function returnLocationasync() {
    uiManager.showNotification(5000, "wait", "Getting Location...", -1);
    // ErrorCallback function
    function errorCB(positionError) {
        alert("ErrorCode: " + positionError.code + " ErrorMessage: " + positionError.message);
    }

    // callback function
    function result(position) {
        // position coordinates
        var longitude = position.coords.longitude;
        var latitude = position.coords.latitude;

        // time when the position was obtained
        var timestamp = position.timestamp;

        // accuracy of the coordinate values
        var accuracy = position.coords.accuracy;
        useLocation(longitude, latitude);
    }

    try {
        so = nokia.device.load("geolocation");

        // timeout at 60000 milliseconds (60 seconds)
        var options = { timeout: 60000 };

        // get the current position
        so.getCurrentPosition(result, errorCB, options);
    }
    catch (e) {
        //alert(e);
        alert("Falling back to Platform Services 1.0");
        returnLocationsync; //fallback to asynchronous lookup where needed.
    }
}

function returnLocationsync() {
    uiManager.showNotification(-1, "wait", "Getting Location...", -1);

    try {
        serviceObj = device.getServiceObject("Service.Location", "ILocation");
    } catch (ex) {
        //
        alert("Service object cannot be found.");
        return;
    }

    // We are interested in basic location information (longitude, latitude and
    // altitude) only, so let's define the criteria respectively
    var criteria = new Object();
    criteria.LocationInformationClass = "BasicLocationInformation";

    // Obtain the location information (synchronous)
    var result = serviceObj.ILocation.GetLocation(criteria);
    latitude = result.ReturnValue.Latitude;
    longitude = result.ReturnValue.Longitude;

    alert(latitude + longitude);
    
    useLocation();
}