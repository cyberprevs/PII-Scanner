import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  minWidth?: number;
  size?: 'small' | 'medium';
}

/**
 * Composant réutilisable pour afficher un sélecteur de filtre
 * Utilisé dans : DashboardPage, RiskyFiles, Detections, Staleness, Exposure, et autres pages avec filtres
 */
export default function FilterSelect({
  label,
  value,
  onChange,
  options,
  minWidth = 200,
  size = 'small',
}: FilterSelectProps) {
  return (
    <FormControl size={size} sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
