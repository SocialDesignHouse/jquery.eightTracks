jquery.eightTracks
==================

A simple jQuery plug-in for dealing with the 8tracks.com API.

It has only been testing with jQuery 2.0.3 so far.

We are starting with anonymous playback and a few other functions, but will add to it over time.

Feel free to fork it and start adding your own methods to the plug-in.

[API Documentation](http://8tracks.com/developers/api)

Usage
=====

Initialization: 

    var settings = {
        perPage : 5,
        sort : 'recent'
    };
    
    var key = xxxxxxxx;
    
    $.eightTracks.init(key, settings);