export interface WidgetOption {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  enabled: boolean;
  order: number;
}
