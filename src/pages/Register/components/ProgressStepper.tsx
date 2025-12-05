import {
  Box,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";

interface ProgressStepperProps {
  activeStep: number;
  steps: string[];
}

export default function ProgressStepper({
  activeStep,
  steps,
}: ProgressStepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          "& .MuiStepLabel-label": {
            color: "#8AC6D0",
            "&.Mui-active": {
              color: "#B8F3FF",
              fontWeight: 600,
            },
            "&.Mui-completed": {
              color: "#8AC6D0",
            },
          },
          "& .MuiStepIcon-root": {
            color: "rgba(138, 198, 208, 0.3)",
            "&.Mui-active": {
              color: "#B8F3FF",
            },
            "&.Mui-completed": {
              color: "#8AC6D0",
            },
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
