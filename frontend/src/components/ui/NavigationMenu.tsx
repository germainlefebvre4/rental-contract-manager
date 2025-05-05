import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Box, Flex, Separator } from '@radix-ui/themes';

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine the active tab based on current path
  const getActiveTab = (): string => {
    if (currentPath.startsWith('/admin')) return 'admin';
    if (currentPath.startsWith('/contract')) return 'contract';
    if (currentPath.startsWith('/renter')) return 'renter';
    if (currentPath.startsWith('/calendar')) return 'calendar';
    return 'home';
  };

  return (
    <Box py="4">
      <Flex justify="center">
        <Tabs.Root defaultValue={getActiveTab()} onValueChange={(value) => {
          switch (value) {
            case 'home':
              navigate('/');
              break;
            case 'admin':
              navigate('/admin');
              break;
            case 'contract':
              navigate('/contract');
              break;
            case 'renter':
              navigate('/renter');
              break;
            case 'calendar':
              navigate('/calendar');
              break;
            default:
              navigate('/');
          }
        }}>
          <Tabs.List>
            <Tabs.Trigger value="home">Home</Tabs.Trigger>
            <Tabs.Trigger value="admin">Admin</Tabs.Trigger>
            <Tabs.Trigger value="contract">Contracts</Tabs.Trigger>
            <Tabs.Trigger value="renter">Renters</Tabs.Trigger>
            <Tabs.Trigger value="calendar">Calendar</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Flex>
      <Separator size="4" my="3" />
    </Box>
  );
};

export default NavigationMenu;