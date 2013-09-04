/*! jquery.eightTracks v0.0.2 - Social Design House */

/*----------------------------------------------------------------------

	@author				Eric Allen
	@twitter			@allenericr
	@company			Social Design House
	@website			http://socialdesignhouse.com/
	@license			MIT
	@copyright			Copyright (c) 2013 Social Design House
	@version			0.0.2

----------------------------------------------------------------------*/

//precede with semi-colon in case other code forgot to end with one
//pass jQuery object, window, document, and undefined parameters
;(function($, window, document, undefined) {

	//initialize object for storing our available methods and variables
	var eightTracks = {};

	//initialize variable for caching jQuery $('body') selector
	var $body = $('body');

	//initialize object for storing default and secure versions of API URL
	var apiURL = {
		regular : 'http://8tracks.com/',
		secure : 'https://8tracks.com/'
	};

	//initialize variable for storing developer API key
	var apiKey = '';

	//initialize varialbe for storing play token
	var playToken = '';

	//initialize varialbe for storing current track
	var track = {};

	//initialize variable for storing current mix
	var mix = {};

	//initialize variable for storing search results
	var search = {};

	//set up default options
	var defaults = {
		perPage : 10,
		sort : 'hot' //options: 'hot', 'popular', 'new'
	};

	var errors = {
		'invalid_id' : 'The ID supplied was not valid',
		'invalid_ids' : 'One or more of the IDs supplied were not valid.',
		'not_logged' : 'Could not log track play. Please try again.',
		'no_token' : 'Could not retrieve play token.',
		'skip_failed' : 'Could not skip track.',
		'next_failed' : 'Could not retrieve next track.',
		'next_mix_failed' : 'Could not retrieve next mix.',
		'find_mix_failed' : 'Could not retrieve specified mix.',
		'mix_failed' : 'Could not start mix.',
		'search_failed' : 'Could not get search results.'
	};

	//initialize object to save data that can be retrived via $.eightTracks.store.[data name]
	eightTracks.store = {};

	//initialization of plug-in: connects to API and retrieves playToken & changes options is settings object is sent
	eightTracks.init = function init(key, settings) {
		var _self = this;

		//check for settings
		if(typeof settings === 'object') {
			_self.options = $.extend({}, defaults, settings);
		}

		//if an API key was sent
		if(typeof key === 'string' && key) {
			apiKey = key;

			//retrieve play token
			getPlayToken();
		//if one wasn't
		} else {
			return false;
		}
	};

	//play a mix by id
	eightTracks.startMix = function startMix(id) {
		var _self = this;

		//set up data object for AJAX call
		var data = {
			mix_id : id,
			api_key : apiKey
		};

		//send data to server and retrieve JSONP
		var ajax = $.ajax({
			type : 'GET',
			url : appendURL('sets/' + playToken + '/play.jsonp'),
			dataType : 'jsonp',
			data : data
		});

		//when AJAX call has finished
		ajax.done(function(data) {
			//if mix was successfully retrieved
			if(data.status == '200 OK') {
				//store mix data
				mix = data;
				eightTracks.store.mix = mix;

				//store current track data
				track = data.set.track;
				eightTracks.store.track = track;


				//trigger 'mixStarted' event: send whole response as first parameter and just track data as second parameter
				$body.trigger('mixStarted', [mix, track]);
			//if mix was not retrieved
			} else {
				//trigger 'mixStarted' error
				$body.trigger('mix_failed', 'mixStarted');
			}
		});
	};

	//skip current track
	//newMix is a boolean that will trigger the next mix if the track skip fails
	//newMixID is the ID of the next mix you would like to play, if omitted the next mix according to 8tracks.com will play
	eightTracks.skipTrack = function skipTrack(mix, newMix, newMixID) {
		//make sure we have a mix ID
		mix = checkID(mix);

		//if mix ID exists
		if(mix) {
			//set up data object for AJAX call
			var data = {
				api_key : apiKey,
				mix_id : mix
			};

			//send data to server and retrieve JSONP
			var ajax = $.ajax({
				type : 'GET',
				url : appendURL('sets/' + playToken + '/skip.jsonp'),
				dataType : 'jsonp',
				data : data
			});

			//when AJAX call has finished
			ajax.done(function(data) {
				//if track was skipped successfully
				if(data.status == '200 OK') {
					//store track
					track = data;
					eightTracks.store.track = data;

					//trigger 'newTrack' event
					$body.trigger('newTrack', track);
				//if the track could not be skipped
				} else {
					//if we should go to a new mix on skip fail
					if(typeof newMix !== 'undefined' && newMix) {
						//if we were sent a mix ID to switch to
						if(checkID(newMixID)) {
							//switch to specified mix
							eightTracks.startMix(newMixID);
						} else {
							//switch to next mix
							eightTracks.nextMix(mix);
						}
					}
				}
			});
		//if mix ID doesn't exist
		} else {
			triggerError('invalid_id', 'newTrack');
		}
	}

	//switch to next track
	//NOTE: Only use this method when the current track has ended
	//you MUST use skipTrack() if the user skips the track
	eightTracks.nextTrack = function nextTrack(mix) {
		//check mix ID
		mix = checkID(mix);

		//if we were given a valid mix ID
		if(checkID(mix)) {
			//set up data object for AJAX call
			var data = {
				api_key : apiKey,
				mix_id : mix
			}

			//send data to server and retrieve JSONP
			var ajax = $.ajax({
				type : 'GET',
				url : appendURL('sets/' + playToken + '/next.jsonp'),
				dataType : 'jsonp',
				data : data
			});

			ajax.done(function(data) {
				//if the next track was successfully retrieved
				if(data.status == '200 OK') {
					track = data;
					eightTracks.track = data;

					$body.trigger('newTrack', track);
				//if the next track wasn't retrieved
				} else {
					//trigger 'newTrack' error
					triggerError('next_failed', 'newTrack');
				}
			});
		//if we weren't given a valid mix ID
		} else {
			//trigger 'newTrack' error
			triggerError('invalid_id', 'newTrack');
		}
	};

	//switch to next mix
	eightTracks.nextMix = function nextMix(mix, mixSet) {
		//check mix ID
		mix = checkID(mix);

		//if we have a valid mix ID
		if(mix) {
			//set up data object for AJAX call
			var data = {
				api_key : apiKey,
				mix_id : mix
			};

			if(typeof mixSet !== 'undefined') {
				mixSet = checkID(mixSet);

				if(mixSet) {
					data['mix_set_id'] = mixSet;
				}
			}

			//send data to server and retrieve JSONP
			var ajax = $.ajax({
				type : 'GET',
				url : appendURL('sets/' + playToken + '/next_mix.jsonp'),
				dataType : 'jsonp',
				data : data
			});

			//when AJAX call has finished
			ajax.done(function(data) {
				//if the next mix was successfully retrieved
				if(data.status == '200 OK') {
					//trigger 'newMix' event
					$body.trigger('newMix', data);
				//if the next mix wasn't retrieved successfully
				} else {
					//trigger 'newMix' error
					triggerError('next_mix_failed', 'newMix');
				}
			});
		//if we don't have a valid mix ID
		} else {
			//trigger 'newMix' error
			triggerError('invalid_id', 'newMix');
		}
	};

	//search for mixes by tag
	eightTracks.tagSearch = function tagSearch(tag) {
		var _self = this;

		//set up data object for AJAX call
		var data = {
			api_key : apiKey,
			sort : _self.options.sort,
			per_page : _self.options.perPage
		};

		//if we were sent an object or array of tags
		if(typeof tag === 'object') {
			//initialize variable to store formatted tag string
			var tag_str = '';

			//itereate through tag object
			for(var i in tag) {
				if(tag.hasOwnProperty(i)) {
					//format tag and append '%2B'
					tag_str += formatTag(tag[i]) + '%2B';
				}
			}

			//remove extraneous "%2B" from the last tag
			tag_str = tag_str.substr(0, tag_str.length - 3);

			//set tags attribute for AJAX data
			data['tags'] = tag_str;
		//if we were only sent a single tag
		} else {
			//format tag and set tag attribute for AJAX data
			data['tag'] = formatTag(tag);
		}

		//send data to server and retrieve JSONP
		var ajax = $.ajax({
			type : 'GET',
			url : appendURL('mixes.jsonp'),
			dataType : 'jsonp',
			data : data
		});

		//when AJAX call has finished
		ajax.done(function(data) {
			//if search results were retrieved
			if(data.status == '200 OK') {
				//store returned object
				search = data;
				eightTracks.store.results = search;

				//trigger searchResultsFound event
				$body.trigger('searchResultsFound', search);
			//if search results were not retrieved
			} else {
				//trigger eightTracksError event
				triggerError('search_failed', 'searchResultsFound');
			}
		});
	};

	//send the play information to 8tracks server for logging
	//NOTE: You must do this after 30 seconds of the track playing
	eightTracks.logPlay = function logPlay(mix, track) {
		//check the mix and track parameters and make sure we have valid IDs
		mix = checkID(mix);
		track = checkID(track);

		//if we have a mix ID and track ID
		if(mix && track) {
			//set up data object for AJAX call
			var data = {
				mix_id : mix,
				track_id : track,
				api_key : apiKey
			};

			//send data to the server and retrieve JSONP
			var ajax = $.ajax({
				type : 'GET',
				url : appendURL('sets/' + playToken + '/report.jsonp'),
				dataType : 'jsonp',
				data : data
			});

			//when AJAX call has finished
			ajax.done(function(data) {
				//if track was successfully logged
				if(data.status == '200 OK') {
					//trigger the 'trackLogged' event
					$body.trigger('trackLogged', data);
				//if track could not be logged
				} else {
					//trigger'trackLogged' error
					triggerError('not_logged', 'trackLogged');
				}
			});
		//if we don't have the track ID and mix ID
		} else {
			//trigger 'trackLogged' error
			triggerError('invalid_ids', 'trackLogged');
		}
	}

	//retrieve playToken from server and trigger playTokenFound event
	function getPlayToken() {
		//set up data object for AJAX call
		var data = {
			api_key : apiKey
		};

		//send data to server and retrieve JSONP
		var ajax = $.ajax({
			type : 'GET',
			url : appendURL('sets/new.jsonp'),
			dataType : 'jsonp',
			data : data
		});

		//when AJAX call has finished
		ajax.done(function(data) {
			//if we successfully retrieved a token
			if(data.status == '200 OK') {
				//save playToken
				playToken = data['play_token'];

				eightTracks.store.token = playToken

				//trigger playTokenFound event
				$body.trigger('playTokenFound', data);
			//if we didn't retrieve a token
			} else {
				//trigger playTokenFound error
				triggerError('no_token', 'playTokenFound');
			}
		});
	}

	//simple way to generate the URLs we need for various API calls
	//append is the string to add to the base API url
	//secure should be boolean (true uses the https:// endpoint, false uses the http:// endpoint)
	function appendURL(append, secure) {
		//use http:// by default
		var url = apiURL.regular;

		//if secure is true
		if(typeof secure !== 'undefined' && secure) {
			//use https:// instead
			url = apiURL.secure;
		}

		//if we have some data to append
		if(typeof append === 'string') {
			//attach it to the URL
			url += append;
		}

		//return the appended URL
		return url;
	}

	//check id of a mix or track
	function checkID(item) {
		//if we were sent an item
		if(typeof item !== 'undefined') {
			//if the item is a string or a number
			if(typeof item === 'string' || typeof item === 'number') {
				//assume it's an id and return it
				return item;
			//if the item isn't a string or number
			} else {
				//if the item is an object and it has an id property
				if(typeof item === 'object' && item.id.length) {
					//if the item's id property is a string or a number
					if(typeof item.id === 'string' || typeof item.id === 'number') {
						//return the item's id property
						return item.id;
					//if the item's id property isn't a string or a number
					} else {
						return false;
					}
				//if the item isn't an object or doesn't have an id property
				} else {
					return false;
				}
			}
		//if we weren't sent an item
		} else {
			return false;
		}
	}

	//format a tag for being sent to the API
	function formatTag(tag) {
		//remove whitespace
		var fTag = $.trim(tag);

		//replace spaces with _
		fTag = fTag.replace(' ', '_');

		//return formatted tag
		return fTag;
	}

	//trigger an error
	//code is a string that corresponds to a message in the errors object
	//triggerEvent (optional) is the name of the event to send the error, too
	function triggerError(code, triggerEvent) {
		//get the message from the errors array
		var msg = errors[code];

		//trigger the eightTracksError event and send the error code and error message as parameters
		$body.trigger('eightTracksError', [code, msg]);

		//if an event to trigger was specified
		if(typeof triggerEvent === 'string') {
			//build data object to send event
			var data = {
				error : 1,
				code : code,
				msg : msg
			};

			//trigger specified event
			$body.trigger(triggerEvent, data);
		}
	}

	//check if $.eightTracks already exists
	if(!$.eightTracks) {
		//if it doesn't, add eightTracks to the main jQuery object $
		$.extend({
			eightTracks : eightTracks
		});
	}

})(jQuery, window, document);