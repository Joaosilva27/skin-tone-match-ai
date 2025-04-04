import Webcam from "react-webcam";
import { useRef, useCallback } from "react";

interface CustomWebcamProps {
  setImgSrc: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomWebcam: React.FC<CustomWebcamProps> = ({ setImgSrc }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    imageSrc && setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  return (
    <div className="camera-container">
      <Webcam
        ref={webcamRef}
        className="webcam-feed"
        screenshotFormat="image/jpeg"
      />
      <button onClick={capture} className="capture-button">
        Capture Photo
      </button>
    </div>
  );
};

export default CustomWebcam;
