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

export default function Second({ dischargeData }) {
  const [selectedOption, setSelectedOption] = useState("soap");
  const [result, setResult] = useState("");
  const [data, setData] = useState();
  const discharge = dischargeData;
  console.log("dischargeData???", discharge);
  console.log(typeof discharge)
  //   console.log(object)

  console.log("result?????", result);
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
        body: JSON.stringify({ text: discharge.transcribedText }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      console.log("data::::", data);
      setData(data);
      setResult(data.text || "No response received");
    } catch (error) {
      setResult("Error fetching data.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const extractNotes = (obj, notes = []) => {
    if (obj) {
      Object.entries(obj)?.forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          extractNotes(value, notes);
        } else if (key === "note" && value) {
          notes.push(value);
        }
      });
      return notes;
    } else {
      return [];
    }
  };

    // const notes = extractNotes(data);

  const dischargeApiData = {
    "Client": dischargeData?.Client || "No Client Name",
    "Reason for Termination": dischargeData?.["Reason for Termination"] || "",
    "Chief Complaint": dischargeData?.["Chief Complaint"] || "",
    "Most Recent Diagnosis": dischargeData?.["Most Recent Diagnosis"] || "",
    "Prescriptions for Medications":
      dischargeData?.["Prescriptions for Medications"] || "",
    "Treatment Modality and Interventions":
      dischargeData?.["Treatment Modality and Interventions"] || "",
    "Treatment Goals and Outcome":
      dischargeData?.["Treatment Goals and Outcome"] || "",
    Recommendations: dischargeData?.["Recommendations"] || "",
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
          height: "300px",
          padding: "1rem",
          overflow: "auto",
          backgroundColor: "#1e1e1e",
          borderRadius: "8px",
        }}
      >
        {loading ? (
          <CircularProgress color="secondary" />
        ) : (
          <Box
            sx={{
              padding: "1rem",
              color: "#e0e0e0",
              display: "flex",
              justifyContent: "left",
            }}
          >
            {data ? (
              <Box sx={{ textAlign: "left", width: "100%" }}>
                {/* Function to render section headers */}
                {(() => {
                  const SectionHeader = ({ title }) => (
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: "underline",
                        color: "#ff9800",
                        marginTop: "1.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      {title}
                    </Typography>
                  );

                  return (
                    <>
                      {/* SOAP Note */}
                      {data.SoapNote && (
                        <>
                          <SectionHeader title="SOAP Note" />
                          <SectionHeader title="Chief Complaint" />
                          <Typography>
                            {data.SoapNote.Subjective?.["Chief Complaint"] ||
                              "N/A"}
                          </Typography>

                          <SectionHeader title="History of Present Illness" />
                          <Typography>
                            {data.SoapNote.Subjective?.[
                              "History of Present Illness"
                            ] || "N/A"}
                          </Typography>

                          <SectionHeader title="Review of Systems" />
                          {Object.entries(
                            data.SoapNote.Subjective?.["Review of Systems"] ||
                              {}
                          ).map(([system, details], index) =>
                            details.note ? (
                              <Typography
                                key={index}
                                sx={{ marginLeft: "1rem" }}
                              >
                                <b style={{ color: "#90caf9" }}>{system}:</b>{" "}
                                {details.note}
                              </Typography>
                            ) : null
                          )}

                          <SectionHeader title="Assessment" />
                          {data.SoapNote.Assessment?.MedicalProblems?.map(
                            (problem, index) => (
                              <Typography key={index}>
                                - {problem.name} (ICD: {problem.ICD})
                              </Typography>
                            )
                          )}

                          <SectionHeader title="Treatment Plan" />
                          {data.SoapNote.Plan?.TreatmentPlanOfProblem?.map(
                            (plan, index) => (
                              <Typography key={index}>
                                <b style={{ color: "#81c784" }}>
                                  {plan.nameOfProblem}:
                                </b>{" "}
                                {plan.treatmentPlan}
                              </Typography>
                            )
                          )}
                        </>
                      )}

                      {/* Triage Note */}
                      {data.TriageNote && (
                        <>
                          <SectionHeader title="Triage Note" />
                          <SectionHeader title="Chief Complaint" />
                          <Typography>
                            {data.TriageNote["Chief Complaint"]}
                          </Typography>

                          <SectionHeader title="History of Present Illness" />
                          <Typography>
                            {data.TriageNote["History of Present Illness"]}
                          </Typography>

                          <SectionHeader title="Demographics" />
                          <Typography>
                            Height: {data.TriageNote.Demographics?.Height}{" "}
                            {data.TriageNote.Demographics?.HeightUnit} | Weight:{" "}
                            {data.TriageNote.Demographics?.Weight}{" "}
                            {data.TriageNote.Demographics?.WeightUnit} | BMI:{" "}
                            {data.TriageNote.Demographics?.BMI}
                          </Typography>

                          <SectionHeader title="Review of Systems" />
                          {Object.entries(
                            data.TriageNote["Review of Systems"] || {}
                          ).map(([system, details], index) =>
                            details.note ? (
                              <Typography
                                key={index}
                                sx={{ marginLeft: "1rem" }}
                              >
                                - {system}: {details.note}
                              </Typography>
                            ) : null
                          )}

                          <SectionHeader title="Medical Problems" />
                          {data.TriageNote["Medical Problems"]?.map(
                            (problem, index) => (
                              <Typography key={index}>
                                - {problem.name} (ICD: {problem.ICD})
                              </Typography>
                            )
                          )}

                          <SectionHeader title="Social History" />
                          {data.TriageNote["Social History"]?.map(
                            (item, index) => (
                              <Typography key={index}>
                                <b>{item.Question}:</b> {item.Answer}
                              </Typography>
                            )
                          )}

                          <SectionHeader title="Triage Category" />
                          <Typography
                            sx={{ color: "#f44336", fontWeight: "bold" }}
                          >
                            {data.TriageNote["Triage Category"]}
                          </Typography>
                        </>
                      )}

                      {/* Discharge Summary */}
                      {console.log(data)}
                      {(data.DischargeNote || dischargeApiData) && (
                        <>
                          <SectionHeader title="Discharge Summary" />

                          {/* Client */}
                          {(data.DischargeNote?.Client ||
                            dischargeApiData?.Client) && (
                            <>
                              <SectionHeader title="Client" />
                              <Typography>
                                {data.DischargeNote?.Client ||
                                  dischargeApiData?.Client}
                              </Typography>
                            </>
                          )}

                          {/* Reason for Termination */}
                          {(data.DischargeNote?.["Reason for Termination"] ||
                            dischargeApiData?.["Reason for Termination"]) && (
                            <>
                              <SectionHeader title="Reason for Termination" />
                              <Typography>
                                {data.DischargeNote?.[
                                  "Reason for Termination"
                                ] ||
                                  dischargeApiData?.["Reason for Termination"]}
                              </Typography>
                            </>
                          )}

                          {/* Chief Complaint */}
                          {(data.DischargeNote?.["Chief Complaint"] ||
                            dischargeApiData?.["Chief Complaint"]) && (
                            <>
                              <SectionHeader title="Chief Complaint" />
                              <Typography>
                                {data.DischargeNote?.["Chief Complaint"] ||
                                  dischargeApiData?.["Chief Complaint"]}
                              </Typography>
                            </>
                          )}

                          {/* Most Recent Diagnosis */}
                          {(data.DischargeNote?.["Most Recent Diagnosis"] ||
                            dischargeApiData?.["Most Recent Diagnosis"]) && (
                            <>
                              <SectionHeader title="Most Recent Diagnosis" />
                              <Typography>
                                {data.DischargeNote?.[
                                  "Most Recent Diagnosis"
                                ] ||
                                  dischargeApiData?.["Most Recent Diagnosis"]}
                              </Typography>
                            </>
                          )}

                          {/* Prescriptions for Medications */}
                          {(data.DischargeNote?.[
                            "Prescriptions for Medications"
                          ] ||
                            dischargeApiData?.[
                              "Prescriptions for Medications"
                            ]) && (
                            <>
                              <SectionHeader title="Prescriptions for Medications" />
                              <Typography>
                                {data.DischargeNote?.[
                                  "Prescriptions for Medications"
                                ] ||
                                  dischargeApiData?.[
                                    "Prescriptions for Medications"
                                  ]}
                              </Typography>
                            </>
                          )}

                          {/* Treatment Modality and Interventions */}
                          {(data.DischargeNote?.[
                            "Treatment Modality and Interventions"
                          ] ||
                            dischargeApiData?.[
                              "Treatment Modality and Interventions"
                            ]) && (
                            <>
                              <SectionHeader title="Treatment Modality and Interventions" />
                              <Typography>
                                {data.DischargeNote?.[
                                  "Treatment Modality and Interventions"
                                ] ||
                                  dischargeApiData?.[
                                    "Treatment Modality and Interventions"
                                  ]}
                              </Typography>
                            </>
                          )}

                          {/* Treatment Goals and Outcome */}
                          {(data.DischargeNote?.[
                            "Treatment Goals and Outcome"
                          ] ||
                            dischargeApiData?.[
                              "Treatment Goals and Outcome"
                            ]) && (
                            <>
                              <SectionHeader title="Treatment Goals and Outcome" />
                              <Typography>
                                {data.DischargeNote?.[
                                  "Treatment Goals and Outcome"
                                ] ||
                                  dischargeApiData?.[
                                    "Treatment Goals and Outcome"
                                  ]}
                              </Typography>
                            </>
                          )}

                          {/* Recommendations */}
                          {(data.DischargeNote?.Recommendations ||
                            dischargeApiData?.Recommendations) && (
                            <>
                              <SectionHeader title="Recommendations" />
                              <Typography>
                                {data.DischargeNote?.Recommendations ||
                                  dischargeApiData?.Recommendations}
                              </Typography>
                            </>
                          )}
                        </>
                      )}

                      {/* Treatment Recommendation */}
                      {data.Recommendation && (
                        <>
                          <SectionHeader title="Treatment Recommendation" />
                          <SectionHeader title="Recommended Diagnosis" />
                          {Object.entries(
                            data.Recommendation.RecommendedDiagnosis || {}
                          ).map(([key, diagnosis]) => (
                            <Typography key={key}>
                              - {diagnosis.name} (ICD-10: {diagnosis["ICD-10"]})
                              | {diagnosis.treatment_plan}
                            </Typography>
                          ))}

                          <SectionHeader title="Recommended Procedures" />
                          {Object.entries(
                            data.Recommendation.RecommendedProcedures || {}
                          ).map(([key, procedure]) =>
                            procedure.name ? (
                              <Typography key={key}>
                                - {procedure.name} (CPT: {procedure.CPT})
                              </Typography>
                            ) : null
                          )}

                          <SectionHeader title="Medications Administered" />
                          <Typography>
                            {
                              data.Recommendation.RecommendedProcedures
                                ?.medications_administered
                            }
                          </Typography>

                          <SectionHeader title="Medication Prescriptions" />
                          <Typography>
                            {
                              data.Recommendation.RecommendedProcedures
                                ?.medication_prescriptions?.name
                            }{" "}
                            (NDC:{" "}
                            {
                              data.Recommendation.RecommendedProcedures
                                ?.medication_prescriptions?.NDC
                            }
                            )
                          </Typography>

                          <SectionHeader title="Recommended Lab Tests" />
                          {Object.entries(
                            data.Recommendation.RecommendedLabTests || {}
                          ).map(([key, lab]) => (
                            <Typography key={key}>
                              - {lab.name} (CPT: {lab.CPT})
                            </Typography>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </Box>
            ) : (
              <Typography>No response yet.</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
