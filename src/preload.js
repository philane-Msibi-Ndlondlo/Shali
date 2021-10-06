const { desktopCapturer, remote  } = require("electron");

const { writeFile } = require("fs");

let screenRecorder = null;
const videoStreamBuffer = [];

const video_dom_elem = document.getElementById("video");
const screen_sources = document.getElementById("screen_sources");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const selectedSource = document.getElementById("selectedSource");


//document.addEventListener("DOMContentloaded", e => {

    getWindows();
/**
 * @description Function that gets all the active windows on the user machine
 * @author Philane Msibi
 */
async function getWindows() {
  const windows = await desktopCapturer.getSources({
    types: ["screen", "window"],
  });

  let output = "";

  Array.from(windows).forEach((source) => {
    output += `<li data-sourceid=${source.id} data-sourcename=${source.name}>
                <p>${source.name}</p>
            </li>`;
  });

  screen_sources.innerHTML = output;

  const screen_sources_li = document.getElementsByTagName("li");

  Array.from(screen_sources_li).forEach((li) => {
    li.addEventListener("click", (e) => {
      let source = { name: li.dataset.sourceid, id: li.dataset.sourceid };
      selectStreamSource(source);
    });
  });
}

startBtn.addEventListener("click", e => {
    startBtn.textContent = "Recording...";
    mediaRecorder.start();

})

stopBtn.addEventListener("click", e => {

    startBtn.textContent = "Start Recording";
    mediaRecorder.stop();
    
})

/**
 * @description Function that selects a stream and shows it to the video tag
 * @author Philane Msibi
 */
async function selectStreamSource(source) {
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  // Create a Stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in a video element
  video_dom_elem.srcObject = stream;
  video_dom_elem.play();

  selectedSource.textContent = source.name + " is live";
  

  // Create the Media Recorder
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = function(event) {
    videoStreamBuffer.push(event.data);
  }

  mediaRecorder.onstop = async function(event) {
      const streamBlob = new Blob(videoStreamBuffer, { type: "video/webm; codecs=vp9" });

      const buffer_temp = await streamBlob.arrayBuffer();

      const buffer = Buffer.from(buffer_temp);
      selectedSource.textContent = "No Video Stream";

    //   const  { filePath } = await dialog.showOpenDialog({
    //       buttonLabel: "Save Video",
    //       defaultPath: `stream-video-${new Date.now()}.webm`
    //   })

    writeFile(`./stream-video-${Date.now()}.webm`, buffer, (err) => {
        if (err) return console.log(err.message);

        console.log("Video Saved")
    });
  }

  // Updates the UI
}


//})