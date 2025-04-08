import Webcam from "react-webcam";
import { useRef, useCallback, useState } from "react";

interface CustomWebcamProps {
  setImgSrc: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomWebcam: React.FC<CustomWebcamProps> = ({ setImgSrc }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  const hide = () => {
    if (webcamRef.current) {
      const videoStream = webcamRef.current.stream;
      videoStream?.getTracks().forEach((track) => track.stop());
      setIsCameraEnabled(false);
    }
  };

  const enable = () => {
    setIsCameraEnabled(true);
  };

  return (
    <div className="camera-container">
      {isCameraEnabled ? (
        <Webcam
          ref={webcamRef}
          className="webcam-feed"
          screenshotFormat="image/jpeg"
        />
      ) : (
        <div className="webcam-feed-disabled"></div>
      )}

      <div className="flex justify-center items-center">
        <button
          onClick={capture}
          className="capture-button flex justify-content w-full"
        >
          <span>Capture Photo</span>
        </button>
        {isCameraEnabled ? (
          <button
            onClick={hide}
            className="capture-button ml-1.5 flex justify-content w-full"
          >
            <span>Hide</span>
          </button>
        ) : (
          <button
            onClick={enable}
            className="capture-button ml-1.5 flex justify-content w-full"
          >
            <span>Show</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomWebcam;
