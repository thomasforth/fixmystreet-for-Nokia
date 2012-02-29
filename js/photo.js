function takePhoto() {
    if (clickFix() == 'clickedOnce') { //horrible hack to fix a problem in s60v3
        return null;
    }
    
    APIBridge.newFileService(
		"Image",
		function(src) {
		    displayPicture(src);
		},
		function(res) {
		    alert(res.status + ";" + res.statusText);
		}
	);
}

function displayPicture(picture) {
    // add a way to close the description if the button is pressed again when its already open
    controls = mainView.getControls();
    alreadyOpenFlag = 'false';
    for (var i in controls) {
        if(controls[i].id == 'imgpath') {
            alreadyOpenFlag = 'true';         
        }        
    }
    if (alreadyOpenFlag == 'true') {
        hideAllContent();
    }
    else {
        hideAllContent();
        mainView.insertControl(imageHolder, submitButton);
        imageHolder.setExpanded(false); //ensures imageHolder is closed. Changing the content whilst open seems to cause a crash in WRT on some models
        //picpath = picture.slice(8);
        picpath = picture.replace(/\/+/gi, "\\"); //this replaces the / in usual dirs with \\ which works with apibridge
        imagePath.setText(picpath);
        imageHolder.setCaption('Image Preview');

        APIBridge.resizeImg(picpath, 500, 1000, true,
            function(smallImg) {
                imageHolder.setContent('<img width="100%" src="' + smallImg + '"/>');
                takePictureButton.setImage(smallImg);
            },
            function(err) {
                alert(err);
                alert('you might need to install the API Bridge or try again');
            }
        );

        mainView.insertControl(imagePath, submitButton);
    }
}

/* old code follows

function onCameraAppLoaded(transId, errorCode, result) {

    if (errorCode == 0) {
        var picture = "";
        var count = result.length;
        for (var i = 0; i < count; i++) {
            picture = result[i] + "\n"; //only take the most recently taken photo
        }
        //Displaying a full-size image within the wrt app is inefficient.
        //It can also use up too much memory and cause a shut down.

        var windowwidth = window.innerWidth - 24;
        var windowheight = window.innerHeight - 24;
        if (windowheight < windowwidth) {
            windowwidth = windowheight;
        }

        function displayPicture() {
            imageHolder.setExpanded(false); //ensures imageHolder is closed. Changing the content whilst open seems to cause a crash in WRT on some models
            picpath = picture.slice(8);
            picpath = picpath.replace(/\/+/gi, "\\"); //this replaces the / in usual dirs with \\ which works with apibridge
            imagePath.setText(picpath);
            imageHolder.setCaption('Image Preview');

            APIBridge.resizeImg(picpath, 500, 1000, true,
		        function(smallImg) {
		            imageHolder.setContent('<img width="100%" src="' + smallImg + '"/>');
		        },
		        function(err) {
		            alert(err);
		            alert('you might need to install the API Bridge or try again');
		        }
	        );

            mainView.insertControl(imagePath, submitButton);
        }
    }
};

*/
