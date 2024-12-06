import axios from 'axios';
import { WidgetOption } from '../components/WidgetCustomizer';

const STORAGE_KEY = 'widget_preferences';

export const widgetPreferencesService = {
  // Save preferences both locally and to the server
  async savePreferences(widgets: WidgetOption[], userId: string): Promise<void> {
    try {
      // Save to local storage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      
      // Save to server
      await axios.post('/api/user/preferences/widgets', {
        userId,
        widgets,
      });
    } catch (error) {
      console.error('Failed to save widget preferences:', error);
      throw error;
    }
  },

  // Load preferences from server, fallback to local storage
  async loadPreferences(userId: string): Promise<WidgetOption[]> {
    try {
      const response = await axios.get(`/api/user/preferences/widgets/${userId}`);
      const widgets = response.data.widgets;
      
      // Update local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      
      return widgets;
    } catch (error) {
      console.warn('Failed to load preferences from server, using local storage:', error);
      
      // Fallback to local storage
      const localPrefs = localStorage.getItem(STORAGE_KEY);
      return localPrefs ? JSON.parse(localPrefs) : getDefaultWidgets();
    }
  },

  // Reset preferences to default
  async resetPreferences(userId: string): Promise<WidgetOption[]> {
    const defaultWidgets = getDefaultWidgets();
    await this.savePreferences(defaultWidgets, userId);
    return defaultWidgets;
  }
};

// Default widget configuration
export const getDefaultWidgets = (): WidgetOption[] => [
  {
    id: 'total-jobs',
    type: 'bar',
    title: 'Total Jobs by Status',
    enabled: true,
    order: 0,
  },
  {
    id: 'earnings-trend',
    type: 'line',
    title: 'Earnings Trend',
    enabled: true,
    order: 1,
  },
  {
    id: 'task-distribution',
    type: 'pie',
    title: 'Task Distribution',
    enabled: true,
    order: 2,
  },
  {
    id: 'completion-rate',
    type: 'line',
    title: 'Task Completion Rate',
    enabled: true,
    order: 3,
  },
  {
    id: 'revenue-by-region',
    type: 'bar',
    title: 'Revenue by Region',
    enabled: false,
    order: 4,
  },
  {
    id: 'top-performers',
    type: 'bar',
    title: 'Top Performers',
    enabled: false,
    order: 5,
  }
];
