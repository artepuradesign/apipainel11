
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  subItems?: SidebarItem[];
  roles?: string[];
  moduleCount?: number;
  description?: string;
  price?: string;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
}
