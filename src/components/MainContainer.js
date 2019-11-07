import React from "react";
import Webcam from "./Webcam";

import * as faceapi from "face-api.js";

class MainContainer extends React.Component {
  constructor(props) {
    super(props);

    this.webcamRef = "webcam";
    this.state = {
      currentStep: "not started",
      detectionStarted: false,
      detection: null,
      faceDetected: null,
      canvas: null
    };
  }

  async componentDidMount() {
    await this._loadModels();
  }

  componentDidUpdate() {
    this._faceDetectionProcess();
  }

  _loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + "/models";
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    // await faceapi.nets.faceExpressionNet.loadFromUri("/models"); --> This is for face expression detection
  };

  _getWebCamCanvas = () => {
    // If we have already the webcam canvas, do nothing
    if (this.state.canvas !== null) {
      return;
    }
    const ref = this.webcamRef;
    let canvas = this.refs[ref].refs[ref].getCanvas();

    this.setState({
      canvas: canvas,
      currentStep: "WebCam canvas detected. Start Face detection"
    });
  };

  _detectFace = async () => {
    // If we have already the detection information or we don't have right now the canvas, do nothing
    if (this.state.detection !== null || this.state.canvas === null) {
      return;
    }
    const detection = await faceapi.detectSingleFace(this.state.canvas);

    this.setState({
      detection: detection,
      currentStep: "Face detected. Starting saving Face Image"
    });
  };

  // If we have already get the face detected or we don't have right now the canvas or detection info, do nothing
  _saveFaceDetected = () => {
    if (
      this.state.canvas === null ||
      this.state.detection === null ||
      this.state.faceDetected !== null
    ) {
      return;
    }
    const offset = 25,
      doubleoOffset = offset * 2,
      detectionBox = this.state.detection.box;
    let resultCanvas = this.refs.result;
    resultCanvas.width = detectionBox.width + doubleoOffset;
    resultCanvas.height = detectionBox.height + doubleoOffset;

    let resultCanvasContext = resultCanvas.getContext("2d");
    // Draw image using webCam canvas and taking an "screenshot"
    resultCanvasContext.drawImage(
      this.state.canvas,
      detectionBox.x - offset,
      detectionBox.y - offset,
      detectionBox.width + doubleoOffset,
      detectionBox.height + doubleoOffset,
      0,
      0,
      detectionBox.width + doubleoOffset,
      detectionBox.height + doubleoOffset
    );

    let data_url = resultCanvas.toDataURL("image/png");
    this.setState({
      faceDetected: data_url,
      currentStep: "Face Image saved. Process ended"
    });
  };

  // Activate for debugging purposes
  // _displayDetectionResult = () => {
  //   if (this.state.canvas === null || this.state.detection === null) {
  //     return;
  //   }
  //   const overlay = this.refs.overlay;
  //   faceapi.matchDimensions(overlay, this.state.canvas);
  //   faceapi.draw.drawDetections(
  //     overlay,
  //     faceapi.resizeResults(this.state.detection, this.state.canvas)
  //   );
  // };

  _faceDetectionProcess = () => {
    this._getWebCamCanvas();
    this._detectFace();
    // this._displayDetectionResult(); --> Activate for debugging purposes
    this._saveFaceDetected();
  };

  _startProcess = () => {
    this.setState({
      detectionStarted: true,
      currentStep: "Process started. Starting WebCam canvas detection"
    });
  };

  _restartProcess = () => {
    let resultCanvas = this.refs.result,
      resultCanvasContext = resultCanvas.getContext("2d");
    resultCanvasContext.clearRect(
      0,
      0,
      resultCanvas.width,
      resultCanvas.height
    );
    this.setState({
      currentStep: "Process re-started. Starting WebCam canvas detection",
      detectionStarted: true,
      detection: null,
      faceDetected: null,
      canvas: null
    });
  };

  // Expresion detection -> Extra options
  // _detectExpresion = async canvas => {
  //   const expresion = await faceapi
  //     .detectSingleFace(canvas)
  //     .withFaceExpressions();
  //   return expresion;
  // };

  render() {
    return (
      <div style={{ position: "relative" }}>
        <Webcam
          ref={this.webcamRef}
          webcamRef={this.webcamRef}
          style={{ zIndex: 1, position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref="overlay"
          style={{ zIndex: 2, position: "absolute", top: 0, left: 0 }}
        />
        <canvas ref="result" />
        {!this.state.detectionStarted ? (
          <button onClick={this._startProcess}>Start Face Detection</button>
        ) : null}
        {this.state.faceDetected !== null ? (
          <button onClick={this._restartProcess}>
            Start Again Face Detection
          </button>
        ) : null}
        {this.state.detectionStarted ? (
          <div>{this.state.currentStep}</div>
        ) : null}
      </div>
    );
  }
}

export default MainContainer;
