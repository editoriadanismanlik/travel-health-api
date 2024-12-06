import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import {
  DragHandle as DragHandleIcon,
  BarChart as BarChartIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export interface WidgetOption {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  enabled: boolean;
  order: number;
}

interface WidgetCustomizerProps {
  open: boolean;
  onClose: () => void;
  widgets: WidgetOption[];
  onSave: (widgets: WidgetOption[]) => void;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case 'bar':
      return <BarChartIcon />;
    case 'line':
      return <LineChartIcon />;
    case 'pie':
      return <PieChartIcon />;
    default:
      return <BarChartIcon />;
  }
};

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  open,
  onClose,
  widgets,
  onSave,
}) => {
  const [localWidgets, setLocalWidgets] = useState<WidgetOption[]>([]);

  useEffect(() => {
    setLocalWidgets([...widgets]);
  }, [widgets]);

  const handleToggleWidget = (id: string) => {
    setLocalWidgets(prev =>
      prev.map(widget =>
        widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setLocalWidgets(updatedItems);
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Customize Analytics Dashboard</Typography>
        <Typography variant="body2" color="textSecondary">
          Select and arrange the widgets you want to see
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ width: '100%' }}
              >
                {localWidgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragHandleIcon />
                        </ListItemIcon>
                        <ListItemIcon>
                          {getChartIcon(widget.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={widget.title}
                          secondary={`Chart Type: ${widget.type}`}
                        />
                        <Checkbox
                          edge="end"
                          checked={widget.enabled}
                          onChange={() => handleToggleWidget(widget.id)}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
