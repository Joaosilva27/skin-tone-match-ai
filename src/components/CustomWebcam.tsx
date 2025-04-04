import Webcam from "react-webcam";
import { useRef, useCallback } from "react";

interface CustomWebcamProps {
  setImgSrc: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomWebcam: React.FC<CustomWebcamProps> = ({ setImgSrc }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current != null) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  return (
    <div className="container">
      <Webcam height={300} width={300} ref={webcamRef} />
      <div className="btn-container">
        <button onClick={capture}>Capture photo</button>
      </div>
    </div>
  );
};

export default CustomWebcam;
