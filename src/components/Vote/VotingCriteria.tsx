import { Box, Slider, Chip, Typography } from "@mui/material";

interface VotingCriteriaProps {
  criteria: {
    name: string;
    label: string;
    icon: string;
  };
  value: number;
  onChange: (event: Event, value: number | number[]) => void;
}

export default function VotingCriteria({
  criteria,
  value,
  onChange,
}: VotingCriteriaProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(184, 243, 255, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#8AC6D0",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{criteria.icon}</span>
          {criteria.label}
        </Typography>
        <Chip
          label={value}
          size="small"
          sx={{
            background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
            color: "#36213E",
            fontWeight: 700,
            minWidth: 40,
          }}
        />
      </Box>
      <Slider
        value={value}
        onChange={onChange}
        min={0}
        max={10}
        step={1}
        marks={[
          { value: 0, label: "0" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
        ]}
        sx={{
          color: "#8AC6D0",
          "& .MuiSlider-thumb": {
            background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
            boxShadow: "0 2px 8px rgba(184, 243, 255, 0.4)",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(184, 243, 255, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            background: "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
            border: "none",
          },
          "& .MuiSlider-rail": {
            background: "rgba(184, 243, 255, 0.2)",
          },
          "& .MuiSlider-mark": {
            background: "rgba(184, 243, 255, 0.4)",
          },
          "& .MuiSlider-markLabel": {
            color: "#8AC6D0",
            fontSize: "0.75rem",
          },
        }}
      />
    </Box>
  );
}
