import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

export interface SearchFilters {
  types: string[];
  status: string[];
  dateFrom?: Date | null;
  dateTo?: Date | null;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

export const AdvancedSearch = ({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedSearchProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.types.length) count++;
    if (filters.status.length) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.sortBy) count++;
    return count;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', py: 1 }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterIcon fontSize="small" />
          <Typography variant="body2">
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <Chip
                size="small"
                label={getActiveFiltersCount()}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        {getActiveFiltersCount() > 0 && (
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Type
            </Typography>
            <Stack direction="row" spacing={1}>
              {['jobs', 'tasks', 'earnings'].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleTypeToggle(type)}
                  color={filters.types.includes(type) ? 'primary' : 'default'}
                  variant={filters.types.includes(type) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <Stack direction="row" spacing={1}>
              {['pending', 'in-progress', 'completed'].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => handleStatusToggle(status)}
                  color={filters.status.includes(status) ? 'primary' : 'default'}
                  variant={filters.status.includes(status) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>

          <Box display="flex" gap={2}>
            <DatePicker
              label="From Date"
              value={filters.dateFrom}
              onChange={(date) => onFiltersChange({ ...filters, dateFrom: date })}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To Date"
              value={filters.dateTo}
              onChange={(date) => onFiltersChange({ ...filters, dateTo: date })}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Min Amount"
              type="number"
              size="small"
              value={filters.minAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minAmount: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <TextField
              label="Max Amount"
              type="number"
              size="small"
              value={filters.maxAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxAmount: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Box>

          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || ''}
                label="Sort By"
                onChange={(e) =>
                  onFiltersChange({ ...filters, sortBy: e.target.value })
                }
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            {filters.sortBy && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={filters.sortOrder || 'desc'}
                  label="Order"
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      sortOrder: e.target.value as 'asc' | 'desc',
                    })
                  }
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
