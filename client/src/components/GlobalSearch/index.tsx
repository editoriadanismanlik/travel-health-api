import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  CircularProgress,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Work as WorkIcon,
  Assignment as TaskIcon,
  AttachMoney as EarningIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { AdvancedSearch, SearchFilters } from './AdvancedSearch';

interface SearchResult {
  id: string;
  type: 'job' | 'task' | 'earning';
  title: string;
  description: string;
}

export const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    status: [],
    dateFrom: null,
    dateTo: null,
    sortBy: '',
    sortOrder: 'desc',
    minAmount: null,
    maxAmount: null,
  });
  const navigate = useNavigate();

  const { data: results, isLoading, refetch } = useQuery<SearchResult[]>(
    ['globalSearch', searchTerm, filters],
    async () => {
      if (!searchTerm && !getActiveFiltersCount(filters)) return [];
      const params = new URLSearchParams({
        q: searchTerm,
        ...(filters.types.length && { types: filters.types.join(',') }),
        ...(filters.status.length && { status: filters.status.join(',') }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { dateTo: filters.dateTo.toISOString() }),
        ...(filters.minAmount && { minAmount: filters.minAmount.toString() }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount.toString() }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });
      const response = await axios.get(`/api/search?${params}`);
      return response.data;
    },
    {
      enabled: false,
      keepPreviousData: true,
    }
  );

  const getActiveFiltersCount = (f: SearchFilters) => {
    let count = 0;
    if (f.types.length) count++;
    if (f.status.length) count++;
    if (f.dateFrom || f.dateTo) count++;
    if (f.minAmount || f.maxAmount) count++;
    if (f.sortBy) count++;
    return count;
  };

  const debouncedSearch = debounce(() => {
    if (searchTerm || getActiveFiltersCount(filters)) {
      refetch();
    }
  }, 300);

  useEffect(() => {
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, filters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setAnchorEl(event.currentTarget);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    refetch();
  };

  const handleResetFilters = () => {
    setFilters({
      types: [],
      status: [],
      dateFrom: null,
      dateTo: null,
      sortBy: '',
      sortOrder: 'desc',
      minAmount: null,
      maxAmount: null,
    });
    refetch();
  };

  const handleClear = () => {
    setSearchTerm('');
    setAnchorEl(null);
  };

  const handleResultClick = (result: SearchResult) => {
    setAnchorEl(null);
    setSearchTerm('');
    
    switch (result.type) {
      case 'job':
        navigate(`/jobs?id=${result.id}`);
        break;
      case 'task':
        navigate(`/tasks?id=${result.id}`);
        break;
      case 'earning':
        navigate(`/earnings?id=${result.id}`);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <WorkIcon color="primary" />;
      case 'task':
        return <TaskIcon color="success" />;
      case 'earning':
        return <EarningIcon color="warning" />;
      default:
        return <SearchIcon />;
    }
  };

  const open = Boolean(anchorEl) && (searchTerm.length > 0 || getActiveFiltersCount(filters));

  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 300 } }}>
        <TextField
          fullWidth
          placeholder="Search jobs, tasks, earnings..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
        />

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
        >
          <Paper elevation={3} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            <AdvancedSearch
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : results?.length ? (
              <List>
                {results.map((result, index) => (
                  <Box key={result.id}>
                    {index > 0 && <Divider />}
                    <ListItem button onClick={() => handleResultClick(result)}>
                      <ListItemIcon>{getIcon(result.type)}</ListItemIcon>
                      <ListItemText
                        primary={result.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                            </Typography>
                            {' — '}
                            {result.description}
                          </>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            ) : (
              <Box p={2}>
                <Typography color="text.secondary" align="center">
                  No results found
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};
