import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";

const SAMPLE_RATE = 16000;
const FRAMES_PER_BUFFER = 1024;

function CircularProgressWithLabel({ value }) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        justifyContent: "center",
      }}
    >
      <CircularProgress variant="determinate" value={value} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function MainPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => {
    setOpenDialog(false);
    setFile(null);
    setMessage("");
    setBtn1Disabled(true);
  };

  const [isBox1Disabled, setIsBox1Disabled] = useState(false);
  const [isBox2Disabled, setIsBox2Disabled] = useState(true);
  const [btn1Disabled, setBtn1Disabled] = useState(true);
  const [btn2Disabled, setBtn2Disabled] = useState(true);

  const handleBtn1Click = () => {
    setIsBox2Disabled(true);
    setIsBox1Disabled(false);
    setBtn2Disabled(false);
  };

  const handleBtn2Click = () => {
    setIsBox1Disabled(true);
    setIsBox2Disabled(false);
    setBtn1Disabled(false);
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    setUploadProgress(0);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      console.log("Uploading File...", formData);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://dev.ai.silkhealth.ai/deepgramMedicalTranscribe"
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log("API Response:", response);
          setApiResponse(response);
          setMessage("File uploaded successfully!");
        } else {
          throw new Error("Upload failed");
        }
        setIsUploading(false);
        setOpenDialog(false);
        setBtn1Disabled(true);
      };

      xhr.onerror = () => {
        setMessage("Failed to upload file.");
        setIsUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      setMessage("Failed to upload file.");
      console.error("Upload Error:", error);
      setIsUploading(false);
    }
  };

  // =================================================== Audio file code ================================================

  const [isStreaming, setIsStreaming] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const processorRef = useRef(null);
  const socketRef = useRef(null);

  const startStreaming = async () => {
    try {
      socketRef.current = new WebSocket("wss://dev.ai.silkhealth.ai/wos/");
      socketRef.current.binaryType = "arraybuffer";
      socketRef.current.onopen = () =>
        console.log("WebSocket connection established");
      socketRef.current.onmessage = (event) => {
        setTranscriptions((prev) => [...prev, event.data]);
      };

      // Initialize Audio Context
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamSourceRef.current =
        audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);

      // Create ScriptProcessorNode
      processorRef.current = audioContextRef.current.createScriptProcessor(
        FRAMES_PER_BUFFER,
        1,
        1
      );
      processorRef.current.onaudioprocess = audioProcessHandler;

      // Connect nodes
      mediaStreamSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setIsStreaming(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  const audioProcessHandler = (event) => {
    const inputBuffer = event.inputBuffer.getChannelData(0);
    const inputData = new Float32Array(inputBuffer.length);
    inputBuffer.forEach((sample, index) => {
      inputData[index] = sample;
    });

    // Convert Float32Array to Int16Array
    const int16Data = convertFloat32ToInt16(inputData);

    // Send audio data to WebSocket server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(int16Data.buffer);
    }
  };

  const convertFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l]) * 0x7fff;
    }
    return buf;
  };

  const stopStreaming = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsStreaming(false);
    setBtn2Disabled(true);
  };

  return (
    <Box>
      <Box
        sx={{
          border: "solid cyan 1px",
          padding: "1rem",
          display: "flex",
          gap: "2rem",
          justifyContent: "space-around",
        }}
      >
        {btn1Disabled && (
        <Box
          sx={{
            width: "200px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => {
              startStreaming();
              handleBtn1Click();
            }}
            disabled={isStreaming}
            sx={{
              border: "solid gray 2px",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "scale(1.05)",
                border: "solid green 2px",
              },
            }}
          >
            <MicIcon /> Speak
          </Button>
          <Button
            onClick={stopStreaming}
            disabled={!isStreaming}
            sx={{
              border: "solid gray 2px",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "scale(1.05)",
                border: "solid red 2px",
              },
            }}
          >
            <MicOffIcon /> Stop
          </Button>
        </Box>)}

        {btn2Disabled && (

        <Button
          onClick={() => {
            handleDialogOpen();
            handleBtn2Click();
          }}
          sx={{
            border: "solid white 2px",
            transition: "0.3s",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              transform: "scale(1.05)",
            },
          }}
        >
          <FileUploadIcon sx={{ fontSize: 25, color: "gray" }} />
          <Typography
            sx={{ paddingLeft: "8px", color: "white", textTransform: "none" }}
          >
            Batch File
          </Typography>
        </Button>)}
      </Box>

      {/* File Upload Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Upload a File
          <IconButton
            onClick={handleDialogClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} />
          {message && <Typography color="error">{message}</Typography>}
        </DialogContent>
        {isUploading && <CircularProgressWithLabel value={uploadProgress} />}
        <DialogActions>
          <Button onClick={handleUpload} variant="contained" color="primary">
            Upload
          </Button>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transcribed Text Box */}
      {isBox1Disabled && (
        <Box
          sx={{
            border: "solid gray 2px",
            marginTop: "3rem",
            height: "200px",
            padding: "1rem",
            overflow: "auto",
          }}
        >
          <h3>Transcribed Text</h3>
          {apiResponse ? (
            <p style={{ whiteSpace: "pre-line" }}>
              {apiResponse.transcribedText}
            </p>
          ) : (
            <p>No response yet. Upload a file.</p>
          )}
        </Box>
      )}
      {/* Live Transcription Box */}
      {isBox2Disabled && (
        <Box
          disabled={isBox1Disabled}
          sx={{
            border: "solid gray 2px",
            marginTop: "3rem",
            height: "200px",
            padding: "1rem",
            overflow: "auto",
          }}
        >
          <h3>Audio to Text</h3>

          <div>
            {transcriptions.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        </Box>
      )}
      
    </Box>
  );
}
