import Webcam from "react-webcam";
import { useRef, useCallback } from "react";

interface CustomWebcamProps {
  setImgSrc: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomWebcam: React.FC<CustomWebcamProps> = ({ setImgSrc }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  return (
    <div className="camera-container">
      <Webcam
        ref={webcamRef}
        className="webcam-feed"
        screenshotFormat="image/jpeg"
      />
      <div className="flex justify-center items-center">
        <button
          onClick={capture}
          className="capture-button flex justify-content w-full"
        >
          <span>Capture Photo</span>
        </button>
      </div>
    </div>
  );
};

export default CustomWebcam;
