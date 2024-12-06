import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Widget {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  dataKey: string;
  nameKey?: string;
  order: number;
  visible: boolean;
}

interface WidgetPreferencesStore {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, 'id' | 'order'>) => void;
  removeWidget: (id: string) => void;
  updateWidgetOrder: (id: string, newOrder: number) => void;
  toggleWidgetVisibility: (id: string) => void;
  resetToDefault: () => void;
}

const defaultWidgets: Widget[] = [
  {
    id: 'jobs-status',
    type: 'pie',
    title: 'Jobs by Status',
    dataKey: 'value',
    nameKey: 'name',
    order: 0,
    visible: true,
  },
  {
    id: 'tasks-trend',
    type: 'line',
    title: 'Tasks Completion Trend',
    dataKey: 'count',
    nameKey: 'date',
    order: 1,
    visible: true,
  },
  {
    id: 'earnings-trend',
    type: 'bar',
    title: 'Earnings Trend',
    dataKey: 'amount',
    nameKey: 'date',
    order: 2,
    visible: true,
  },
  {
    id: 'top-earnings',
    type: 'bar',
    title: 'Top Earning Jobs',
    dataKey: 'value',
    nameKey: 'name',
    order: 3,
    visible: true,
  },
];

export const useWidgetPreferences = create<WidgetPreferencesStore>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      addWidget: (widget) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              ...widget,
              id: Math.random().toString(36).substr(2, 9),
              order: state.widgets.length,
            },
          ],
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      updateWidgetOrder: (id, newOrder) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, order: newOrder } : w
          ),
        })),
      toggleWidgetVisibility: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),
      resetToDefault: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'widget-preferences',
    }
  )
);
