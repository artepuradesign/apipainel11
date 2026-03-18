
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Settings, Package, Palette, Layout } from 'lucide-react';

interface PersonalizationSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'plans',
    title: 'Planos',
    icon: Settings,
    description: 'Gerenciar planos disponíveis'
  },
  {
    id: 'modules',
    title: 'Módulos',
    icon: Package,
    description: 'Personalizar módulos do sistema'
  },
  {
    id: 'appearance',
    title: 'Aparência',
    icon: Palette,
    description: 'Cores e temas'
  },
  {
    id: 'layout',
    title: 'Layout',
    icon: Layout,
    description: 'Estrutura da interface'
  }
];

const PersonalizationSidebar = ({ activeSection, onSectionChange }: PersonalizationSidebarProps) => {
  return (
    <Sidebar className="w-80">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            Personalização
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeSection === item.id}
                  >
                    <button
                      onClick={() => onSectionChange(item.id)}
                      className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default PersonalizationSidebar;
