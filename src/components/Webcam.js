import React from "react";
import WebCam from "react-webcam";

class Webcam extends React.Component {
  constructor(props) {
    super(props);
    this.videoConstraints = {
      width: 640,
      height: 480,
      facingMode: "user"
    };
  }

  render() {
    return (
      <WebCam
        audio={false}
        height={480}
        ref={this.props.webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
        videoConstraints={this.videoConstraints}
      />
    );
  }
}

export default Webcam;
