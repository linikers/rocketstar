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
        p: { xs: 1.5, sm: 2 },
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
          mb: 1.5,
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
            fontSize: { xs: "0.85rem", sm: "0.875rem" },
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{criteria.icon}</span>
          {criteria.label}
        </Typography>
        <Box
          sx={{
            background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
            color: "#36213E",
            fontWeight: 700,
            borderRadius: 1,
            minWidth: 36,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            px: 1,
          }}
        >
          {value}
        </Box>
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
          py: { xs: 1, sm: 0 },
          "& .MuiSlider-thumb": {
            width: { xs: 32, sm: 24 },
            height: { xs: 32, sm: 24 },
            background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
            boxShadow: "0 2px 8px rgba(184, 243, 255, 0.4)",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 10px rgba(184, 243, 255, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            height: { xs: 8, sm: 6 },
            background: "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
            border: "none",
          },
          "& .MuiSlider-rail": {
            height: { xs: 8, sm: 6 },
            background: "rgba(184, 243, 255, 0.2)",
          },
          "& .MuiSlider-mark": {
            width: 2,
            height: { xs: 8, sm: 6 },
            background: "rgba(184, 243, 255, 0.4)",
          },
          "& .MuiSlider-markLabel": {
            color: "#8AC6D0",
            fontSize: { xs: "0.75rem", sm: "0.75rem" },
          },
        }}
      />
    </Box>
  );
}
