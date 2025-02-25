import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function Second() {
  const [selectedOption, setSelectedOption] = useState("soap");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrls = {
    soap: "https://dev.ai.silkhealth.ai/soapNotesGenerator",
    triage: "https://dev.ai.silkhealth.ai/triageNotesGenerator",
    discharge: "https://dev.ai.silkhealth.ai/dischargeNotesGenerator",
    treatment: "https://dev.ai.silkhealth.ai/recommendedProcedures",
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(apiUrls[selectedOption], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: selectedOption }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      setResult(data.text || "No response received");
    } catch (error) {
      setResult("Error fetching data.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          marginTop: "3rem",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <FormControl component="fieldset">
          <FormLabel sx={{ color: "white", textAlign: "center" }}>
            Notes
          </FormLabel>
          <RadioGroup
            row
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            name="radio-buttons-group"
          >
            <FormControlLabel value="soap" control={<Radio />} label="SOAP" />
            <FormControlLabel
              value="triage"
              control={<Radio />}
              label="Triage"
            />
            <FormControlLabel
              value="discharge"
              control={<Radio />}
              label="Discharge"
            />
            <FormControlLabel
              value="treatment"
              control={<Radio />}
              label="Treatment Recommendation"
            />
          </RadioGroup>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            marginTop: "1rem",
            border: "solid cyan 2px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "cyan",
            transition: "0.3s",
            "&:hover": {
              color: "black",
              backgroundColor: "cyan",
              transform: "scale(1.05)",
              border: "solid 2px",
            },
          }}
        >
          Submit
        </Button>
      </Box>

      <Box
        sx={{
          border: "solid gray 2px",
          marginTop: "3rem",
          height: "200px",
          padding: "1rem",
          overflow: "auto",
        }}
      >
        {loading ? (
          <CircularProgress color="secondary" />
        ) : (
          <Typography sx={{ whiteSpace: "pre-line", color: "white" }}>
            {<p style={{ whiteSpace: "pre-line" }}>{result}</p> ||
              "No response yet."}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
