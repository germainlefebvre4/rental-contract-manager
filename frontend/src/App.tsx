import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Theme, Container, Flex, Box, Heading, Text } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import AdminPage from './pages/admin/AdminPage';
import ContractPage from './pages/contract/ContractPage';
import RenterPage from './pages/renter/RenterPage';
import CalendarPage from './pages/calendar/CalendarPage';
import NavigationMenu from './components/ui/NavigationMenu';

const HomePage: React.FC = () => (
  <Box className="home-page" p="6">
    <Heading size="8" mb="4">Welcome to the Rental Contract Manager</Heading>
    <Text size="5" mb="6">A platform for managing rental contracts and products.</Text>
    
    <Flex direction="column" gap="4" className="features">
      <Box>
        <Heading size="5" mb="2">For Renters</Heading>
        <Text>Browse available products, view rental history, and manage your active rentals.</Text>
      </Box>
      
      <Box>
        <Heading size="5" mb="2">For Administrators</Heading>
        <Text>Manage inventory, track contract status, and update product information.</Text>
      </Box>
      
      <Box>
        <Heading size="5" mb="2">Contract Management</Heading>
        <Text>Create, view, and manage rental contracts with comprehensive tracking.</Text>
      </Box>
    </Flex>
  </Box>
);

const App: React.FC = () => {
  return (
    <Theme appearance="light" accentColor="blue" radius="medium">
      <Router>
        <Container size="4">
          <Flex direction="column" gap="4">
            <NavigationMenu />
            <Box p="4">
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/contract" element={<ContractPage />} />
                <Route path="/renter" element={<RenterPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/" element={<HomePage />} />
              </Routes>
            </Box>
          </Flex>
        </Container>
      </Router>
    </Theme>
  );
};

export default App;