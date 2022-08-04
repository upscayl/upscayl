import Upscaler from "upscaler";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

const upscaler = new Upscaler();
function App() {
  const [src, setSrc] = useState<string>();
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [interpolation, setInterpolation] = useState("bicubic");
  const [upscaledImageSrc, setUpscaledImageSrc] = useState<string>();
  const [displayUpscaledImageSrc, setDisplayUpscaledImageSrc] = useState(false);
  const [dragX, setDragX] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const container = useRef<HTMLDivElement>();
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const fr = new FileReader();
    fr.onload = async () => {
      setSrc(fr.result as string);
    };
    fr.readAsDataURL(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  useEffect(() => {
    if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        upscaler.upscale(img).then(setUpscaledImageSrc);
        const width = img.width;
        const height = img.height;
        setOriginalSize({
          width,
          height,
        });
      };
    }
  }, [src]);

  useEffect(() => {
    if (originalSize) {
      let upscaledImageSrcTimer;
      const timer = setTimeout(() => {
        setScale(3);
        upscaledImageSrcTimer = setTimeout(() => {
          setDisplayUpscaledImageSrc(true);
        }, 1200);
      }, 300);
      return () => {
        clearTimeout(timer);
        clearTimeout(upscaledImageSrcTimer);
      };
    }
  }, [originalSize]);

  const startDragging = () => {
    setDragging(true);
  };

  const drag = (e) => {
    if (dragging) {
      const offsetWidth = container.current.offsetWidth;
      const x = e.clientX - (window.innerWidth - offsetWidth) / 2 - 10;
      setDragX(x / offsetWidth);
    }
  };

  const stopDragging = () => {
    console.log("stop");
    setDragging(false);
  };

  if (src) {
    const left = dragX * 100;
    return (
      <div
        className="original-image"
        style={{
          width: originalSize ? originalSize.width * scale : null,
        }}
      >
        <div className="header">
          {displayUpscaledImageSrc && (
            <>
              <div className="interpolation">
                <button
                  className={interpolation === "none" ? "active" : null}
                  onClick={() => setInterpolation("none")}
                >
                  None
                </button>
                <button
                  className={interpolation === "bicubic" ? "active" : null}
                  onClick={() => setInterpolation("bicubic")}
                >
                  Bicubic interpolation
                </button>
              </div>
              <div>Upscaled image</div>
            </>
          )}
        </div>
        <div
          className="display"
          style={{
            width: originalSize ? originalSize.width * scale : null,
            height: originalSize ? originalSize.height * scale : null,
          }}
        >
          {displayUpscaledImageSrc && (
            <div
              className="dragOverlay"
              ref={container}
              onMouseMove={drag}
              onMouseUp={stopDragging}
            >
              <div
                className="dragger"
                onMouseDown={startDragging}
                style={{
                  left: `calc(${left}%)`,
                }}
              />
            </div>
          )}
          <div className="image-container original">
            <img
              src={src}
              alt="Original"
              width={originalSize ? originalSize.width * scale : null}
              style={{
                imageRendering: interpolation === "none" ? "pixelated" : null,
              }}
            />
          </div>
          {displayUpscaledImageSrc && (
            <div
              className="image-container scaled-up"
              style={{
                width: `${100 - left}%`,
                left: `${left}%`,
              }}
            >
              <img
                style={{
                  left: ((originalSize.width * scale * left) / 100) * -1,
                }}
                alt="Upscaled"
                src={upscaledImageSrc}
                width={originalSize ? originalSize.width * scale : null}
              />
            </div>
          )}
        </div>
        {displayUpscaledImageSrc && <p>Resized to 3x</p>}
      </div>
    );
  }

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}

export default () => {
  return (
    <div className="app">
      <h1>React Demo Integration</h1>
      <App />
    </div>
  );
};
