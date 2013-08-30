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