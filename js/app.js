/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;

var session;
var publisher;
var basePublisherOptions = {
  insertMode: "append",
  width: "100%",
  height: "100%",
};
var publisherOptions = {
  ...basePublisherOptions,
  publishVideo: false,
  videoSource: null,
};

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  console.log("init session");
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on("streamCreated", function streamCreated(event) {
    console.log("streamCreated event received");
    var subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };
    console.log("subscribe to created stream...");
    session.subscribe(
      event.stream,
      "subscriber",
      subscriberOptions,
      handleError
    );
  });

  session.on("sessionDisconnected", function sessionDisconnected(event) {
    console.log("You were disconnected from the session.", event.reason);
  });

  // initialize the publisher
  console.log("Init publisher...");
  publisher = OT.initPublisher("publisher", publisherOptions, handleError);

  // Connect to the session
  console.log("sesssion connecting...");

  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      console.log("publish into session with mic only");
      session.publish(publisher, handleError);
    }
  });
}

function republishWithVideo() {
  session.unpublish(publisher);
  // video is on
  if (publisherOptions.publishVideo == true) {
    console.log("republish with video off");
    publisherOptions = {
      ...basePublisherOptions,
      publishVideo: false,
      videoSource: null,
    };
    document.getElementById("videobutton").innerHTML = "VIDEO ON";
    // video is off
  } else {
    console.log("republish with video on");
    publisherOptions = {
      ...basePublisherOptions,
      publishVideo: true,
    };
    document.getElementById("videobutton").innerHTML = "VIDEO OFF";
  }
  console.log("new pub options: ", publisherOptions);
  publisher = OT.initPublisher("publisher", publisherOptions, handleError);
  session.publish(publisher);
}

// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + "/session")
    .then(function fetch(res) {
      return res.json();
    })
    .then(function fetchJson(json) {
      apiKey = json.apiKey;
      sessionId = json.sessionId;
      token = json.token;

      initializeSession();
    })
    .catch(function catchErr(error) {
      handleError(error);
      alert(
        "Failed to get opentok sessionId and token. Make sure you have updated the config.js file."
      );
    });
}
