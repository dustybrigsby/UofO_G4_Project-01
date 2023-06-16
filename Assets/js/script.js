$(document).ready(function() {
  
  // Global variables
  var map;
  var service = new google.maps.places.PlacesService(map);
  var locationAPI = "pk.89ed628237a7d3a065d576b871965ac0";
  var iQAirAPI = "3ac59854-8742-4b4c-b4f1-4ea76e8f0301";

  // function to get local storage & render last 3-4 zipcodes

  function searchZipcode(event) {
    event.preventDefault();
    var input = $(this).closest('.search-form').find('.zip-input');
    var zip = input.val();
  
    if (zip) {
        getCoordinates(zip);
    }
  
    // Clear input field
    input.val('');
  }

  // Get coordinates for the user-inputted Zipcode
  function getCoordinates(zip) {
    var coordinatesURL = "https://us1.locationiq.com/v1/search?key=" + locationAPI + "&country=USA&postalcode=" + zip + "&format=json";
    
  
    fetch(coordinatesURL) 
    .then(function(response){
        
        if(response.ok) {
            var json = response.json();
            return json;
        }
    }).then (function(data){
                
      var lat = data[0].lat;
      var lng = data[0].lon;
      var locDetails = data[0].display_name;
      //getCampgrounds(lat, lng);
      getAirQuality(lat, lng, locDetails);
  });
  }

  // Get the air quality of the Zipcode's coordinates
  function getAirQuality(lat, lng, locDetails) {
    var  airQualityUrl = "http://api.airvisual.com/v2/nearest_city?lat=" + lat + "&lon=" + lng + "&key=" + iQAirAPI;
    
    fetch(airQualityUrl)
    .then(function (response) {
        
        if(response.ok) {
            response.json().then(function (data) {
                var aqi = data.data.current.pollution.aqius;
                // var city = data.data.city;
                // var state = data.data.state;
                
                
                displayResults(aqi, locDetails);
                
            })
        }
    });
  }

  function displayResults(aqi, locDetails) {
    var currentContainer = $('#current-air');
    var resourcesContainer = $('#resources-container');
    var displayAQI = $('#display-aqi');
    displayAQI.text("Your Air quality is " + aqi +" in " + locDetails);
    if (aqi < 50) { // if air quality = good
      var positiveMessage = $('<div>');
      positiveMessage.addClass('ui floating positive message');
      positiveMessage.text('Pack your things, the air quality is good enough to camp!');
      currentContainer.append(positiveMessage);
      $('#campgrounds').removeClass('hide');
    } else if (aqi > 50 && aqi < 150) { // if air quality = moderate
      var moderateMessage = $('<div>');
      moderateMessage.addClass('ui floating warning message');
      moderateMessage.text('Air quality is acceptable for camping. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.');
      currentContainer.append(moderateMessage);
      $('#campgrounds').removeClass('hide');
    } else { // if air quality = unhealthy or worse
      var negativeMessage = $('<div>');
      var resourceTitle = $('<h3>');
      negativeMessage.addClass('ui floating negative message');
      currentContainer.append(negativeMessage);
      currentContainer.append(resourceTitle);
      negativeMessage.text("The air quality around you is unhealthy for most. Maybe not the best time to camp. Curl up with a good book and minimize your time outside.");
      resourceTitle.text('In the meantime, please check out the great organizations below and how you can help fight air pollution.');
      // Show extra resource links
      // resourcesContainer.removeClass('hide');
    }
    return;
  }
  // Suggest other zipcodes to camp in ?
  //     var otherZips = $("#nearby-zips");
  //     otherZips.text(
  //       "Try searching these closest zipcodes. They have a bit better air quality."
  //     );
  //   }
  // }

  // TODO: function to save inputted zipcode to local storage
  // If user has nothing in local storage, show entry screen + hide results.
  // If user has something in local storage, hide entry screen + show results.

  // function to fetch info from Google Maps api for nearby Campgrounds from a given zip code
  function initMap(lat, lng, zip) {
    console.log("lat: " + lat);
    console.log("lng: " + lng);

    var coords = new google.maps.LatLng(lat, lng);

    console.log("coords: " + coords);

    // The map, centered at searched zip
    map = new google.maps.Map(document.getElementById("campgrounds"), {
      zoom: 10,
      center: coords,
    });

    var nearbyCampgrounds = [];

    service.nearbySearch(
      {
        location: coords,
        radius: 50000,
        type: ["campground"],
      },
      (results, status) => {
        console.log("results: " + results);

        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
            nearbyCampgrounds.push(results[i]);
            createMarker(results[i]);
          }
        }
      }
    );
  }

  function createMarker(result) {
    console.log("result: " + result);

    var marker = new google.maps.Marker({
      map: map,
      position: result.geometry.location,
    });

    marker.setLabel(result.name + " ");
    marker.setClickable(true);
  }

    // Search button Event Listener
    $("#search-btn-1").on("click", searchZipcode);
    $("#search-btn-2").on("click", searchZipcode);
    initMap(45.5152, -122.6784, 97203);

});