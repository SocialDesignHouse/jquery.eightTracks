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
        //logic here
    });

`eventName` should be a string and should be the name of an event.

`e` will contain the event information, like type, name, etc and isn't particularly useful in most cases.

`response` will contain the information returned from the plug-in.

Some events send more than one parameter to their event listener, they will be noted in the documentation.

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

When the plug-in encounters an error, it will always trigger the `eightTracksError` event and send the error code and error message to that event's listener. This is useful if you want to log errors or perform some sort of connection status checks when an error is encountered.

    $('body').on('eightTracksError', function(e, code, message) {
        console.log(code + ': ' + message);
    });

List of implemented events:

* `playTokenFound`
* `searchResultsFound`
* `mixStarted`
* `newTrack`
* `playLogged`
* `newMix`
* `eightTracksError`

**Data Store**

If you need to access any of the current variables for track, mix, playToken, or search results you can access the `$.eightTracks.store` object.

    $.eightTracks.store.mix; //current mix object

    $.eightTracks.store.track; //current track object

    $.eightTracks.store.token; //current play token

    $.eightTracks.store.results; //current search results object

**Initialization**:

    var settings = {
        perPage : 5,
        sort : 'recent'
    };
    
    var key = xxxxxxxx;
    
    $.eightTracks.init(key, settings);

This will initialize the playToken you will need to listen to 8tracks mixes.

You can add a listener for the `playTokenFound` event if you want to save the token or perform another action

    $('body').on('playTokenFound', function(e, response) {
        //console.log(response);
        
        var token = response['play_token'];
    });

**Search By Tag**:

    var tag = ['house', 'hip hop', 'electro'];
    //or var tag = 'house';
    
    $.eightTracks.tagSearch(tag);

This will search for the tag or collection of tags you send and return a set of mixes.

You can add a listener for the `searchResultsFound` event to perform actions with the results

    $('body').on('searchResultsFound', function(e, response) {
        //console.log(response);
        
        var mix = response.mixes[0];
    });

**Start Mix**:

    $.eightTracks.startMix(mix.id);
    //or $.eightTracks.startMix(mix);

This will retrieve the first track for the mix, you can send either a mix object or mix id.

You can add a listener for the `mixStarted` event to get the track info

    $('body').on('mixStarted', function(e, mix, track) {
        //console.log(mix);
        //console.log(track);
        
        var track_id = track.id;
        var track_name = track.name;
        var track_by = track.performer;
        var track_stream = track.url;
    });

**Report Track Play**:

NOTE: You MUST do this at the 30 second mark of a playing track.

    $.eightTracks.logPlay(mix.id, track.id);
    //or $.eightTracks.logPlay(mix, track);

This will tell the 8tracks.com server that the track has been played so that it can use that information to calculate royalties.

You can add a listener for the `trackLogged` event to perform an action after the track has been logged
 
    $('body').on('trackLogged', function(e, response) {
        //console.log(response);
    });

**Next Track**:

NOTE: You MUST use the .skipTrack() method if the user has initiated the next track.

This method is only for when the currently playing track has ended

    $.eightTracks.nextTrack(mix.id);
    //or $.eightTracks.nextTrack(mix);

This will retrieve the next track in the mix and return that track's information, you can send either a mix object or the mix ID.

You can add a listener for the `newTrack` event to perform actions with the track data.

    $('body').on('newTrack', function(e, response) {
        //console.log(response);
    });

**Skip Track**:

    $.eightTracks.skipTrack(mix.id);
    //or $.eightTracks.skipTrack(mix);

This will retrieve the next track if the user can currently skip, if they are out of skips, it will return an error.

We have set up this method to accept two additional parameters `newMix` and `newMixID`.

`newMix` is boolean and if true the plug-in will attempt to retrieve a new mix if the skip fails.

`newMixID` accepts a mix ID or a mix object and allows you to specify which mix to start if the skip fails

    $.eightTracks.skipTrack(mix.id, true, nextMix.id);
    //or $.eightTracks.skipTrack(mix.id, true);

You can add a listener for the `newTrack` event to perform actions with the track data

    $('body').on('newTrack', function(e, response) {
        //console.log(response);
    });

**Next Mix**:

    $.eightTracks.nextMix(mix.id);
    //or $.eightTracks.skipTrack(mix);

This will retrieve the next mix in the 8tracks.com similar mixes feed for the current mix. If you want to retrieve the next mix in the search results, you will need to call `$.eightTracks.startMix()` with that mix's ID.

You can add a listener for the `newMix` event to perform actions with the mix data.

    $('body').on('newMix', function(e, response) {
        //console.log(response);
    });

**Errors**:

The possible error codes and their corresponding messages are listed below in case you want to perform some kind of special logging for certain errors.

* `invalid_id` - The ID supplied was not valid.
* `invalid_ids` - One or more of the IDs supplied were not valid.
* `not_logged` - Could not log track play. Please try again.
* `no_token` - Could not retrieve play token.
* `skip_failed` - Could not skip track.
* `next_failed` - Could not retrieve next track.
* `next_mix_failed` - Could not retrieve next mix.
* `find_mix_failed` - Could not retrieve specified mix.
* `mix_failed` - Could not start mix.
* `search_failed` - Could not get search results.