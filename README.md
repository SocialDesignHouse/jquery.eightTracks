jquery.eightTracks
==================

A simple jQuery plug-in for dealing with the 8tracks.com API.

It has only been testing with jQuery 2.0.3 so far.

We are starting with anonymous playback and a few other functions, but will add to it over time.

Feel free to fork it and start adding your own methods to the plug-in.

[API Documentation](http://8tracks.com/developers/api)

Usage
=====

More documentation is coming, but you can always read the source to get an idea of what the other methods do and how they work.

**Events**:

Every action the plug-in takes has a corresponding event that gets triggered that you can add an event listener to via the `.on()` method. These events are triggered on the `body`. You can use this as a template for your event bindings:

    $('body').on(eventName, function(e, response) {
        //eventName should be a string and should be the name of an event
        //e will contain the event information
        //response will contain the information returned from the plug-in
        
        //some events send more than one parameter to their event listener, they will be noted in the documentation
        
        //logic here
    });

In the event of an error, the plug-in's response will look like this:

    response = {
    	'error' : 1,
    	'code' : code, //this will be a string that corresponds to the reason this event failed
    	'msg' : msg //this will explain why this event failed
    };

You should check each event's response for an error like so:

    $('body').on(eventName, function(e, response) {
        //this will ensure any error fields that might exist in the API response are not confused for a plug-in error
        if(typeof response.error !== 'undefined' && typeof response.code !== 'undefined' && response.error === 1) {
            //error logic
        } else {
            //success logic
        }
    });

**Initialization**:

    var settings = {
        perPage : 5,
        sort : 'recent'
    };
    
    var key = xxxxxxxx;
    
    $.eightTracks.init(key, settings);
    
    //this will initialize the playToken you will need to listen to 8tracks mixes
    //you can add a listener for the 'playTokenFound' event if you want to save the token or perform another action
    
    $('body').on('playTokenFound', function(e, response) {
        //console.log(response);
        
        var token = response['play_token'];
    });

**Search By Tag**:

    var tag = ['house', 'hip hop', 'electro'];
    //or var tag = 'house';
    
    $.eightTracks.tagSearch(tag);
    
    //this will search for the tag or collection of tags you send
    //you can add a listener for the 'searchResultsFound' event to perform actions with the results
    
    $('body').on('searchResultsFound', function(e, response) {
        //console.log(response);
        
        var mix = response.mixes[0];
    });

**Start Mix**:

    $.eightTracks.startMix(mix.id);
    //or $.eightTracks.startMix(mix);
    
    //this will retrieve the first track for the mix, you can send either a mix object or mix id
    //you can add a listener for the 'mixStarted' event to get the track info
    
    $('body').on('mixStarted', function(e, mix, track) {
        //console.log(mix);
        //console.log(track);
        
        var track_id = track.id;
        var track_name = track.name;
        var track_by = track.performer;
        var track_stream = track.url;
    });

**Report Track Play**:

    //NOTE: You MUST do this at the 30 second mark of a playing track.
    
    $.eightTracks.logPlay(mix.id, track.id);
    //or $.eightTracks.logPlay(mix, track);
    
    //this will tell the 8tracks.com server that the track has been played so that it can use that information to calculate royalties
    //you can add a listener for the 'trackLogged' event to perform an action after the track has been logged
    
    $('body').on('trackLogged', function(e, data) {
        //console.log(data);
    });