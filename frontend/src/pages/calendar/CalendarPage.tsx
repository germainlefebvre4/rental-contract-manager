import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { 
  Box, 
  Heading, 
  Card, 
  Text, 
  Badge, 
  Flex,
  Select,
  Dialog,
  Grid,
  Button
} from '@radix-ui/themes';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getContractsByDateRange, getProducts, getUsers } from '../../services/api';
import { Contract, Product, User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Setup the localizer for the calendar using date-fns
const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define the event type for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  contract: Contract;
  resource?: any;
}

// Interface for rental statistics
interface RentalStats {
  activeContracts: number;
  pendingContracts: number;
  completedContracts: number;
  cancelledContracts: number;
  totalRevenue: number;
  averageDuration: number;
  topProduct: string;
}

const CalendarPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<string>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(1)), // First day of current month
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // Last day of current month
  });

  // Load initial products and contracts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productsData, usersData] = await Promise.all([
          getProducts(),
          getUsers()
        ]);
        
        setProducts(productsData);
        setUsers(usersData);
        
        await fetchContractsForRange(dateRange.start, dateRange.end);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch contracts when date range changes
  const fetchContractsForRange = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      
      // Add a buffer to the date range to ensure we get all relevant contracts
      const bufferStart = addMonths(start, -1);
      const bufferEnd = addMonths(end, 1);
      
      const contractsData = await getContractsByDateRange(bufferStart, bufferEnd);
      
      setContracts(contractsData);
    } catch (error) {
      console.error('Error fetching contracts for range:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar date navigation
  const handleRangeChange = (range: any) => {
    if (Array.isArray(range)) {
      // This is for week or day view
      setDateRange({
        start: range[0],
        end: range[range.length - 1]
      });
      fetchContractsForRange(range[0], range[range.length - 1]);
    } else {
      // This is for month view
      setDateRange({
        start: range.start,
        end: range.end
      });
      fetchContractsForRange(range.start, range.end);
    }
  };

  // Convert contracts to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return contracts
      .filter(contract => selectedProduct === 'all' || contract.productId === selectedProduct)
      .map(contract => ({
        id: contract.id,
        title: contract.product 
          ? `${contract.product.object} (${contract.user?.firstName || 'Unknown'})` 
          : `Contract #${contract.id}`,
        start: new Date(contract.startDate),
        end: new Date(contract.endDate),
        contract
      }));
  }, [contracts, selectedProduct]);

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Pending': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Handle event click to show details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedContract(event.contract);
    setDetailsOpen(true);
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const style: React.CSSProperties = {
      backgroundColor: event.contract.status === 'Active' ? '#4CAF50' 
                     : event.contract.status === 'Pending' ? '#FFC107'
                     : event.contract.status === 'Completed' ? '#2196F3'
                     : event.contract.status === 'Cancelled' ? '#F44336'
                     : '#9E9E9E',
      borderRadius: '4px',
      color: '#fff',
      border: 'none',
      display: 'block',
      opacity: 0.8
    };
    return { style };
  };

  // Calculate rental statistics for current view
  const rentalStats: RentalStats = useMemo(() => {
    const activeContracts = contracts.filter(c => c.status === 'Active').length;
    const pendingContracts = contracts.filter(c => c.status === 'Pending').length;
    const completedContracts = contracts.filter(c => c.status === 'Completed').length;
    const cancelledContracts = contracts.filter(c => c.status === 'Cancelled').length;
    
    const totalRevenue = contracts.reduce((sum, contract) => sum + contract.totalPrice, 0);
    
    // Calculate average rental duration in days
    const durations = contracts.map(contract => {
      const start = new Date(contract.startDate);
      const end = new Date(contract.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;
    
    // Find the most rented product
    const productCounts = contracts.reduce((counts: Record<string, number>, contract) => {
      const productId = contract.productId;
      if (!counts[productId]) counts[productId] = 0;
      counts[productId]++;
      return counts;
    }, {});
    
    let topProductId = '';
    let maxCount = 0;
    
    for (const [productId, count] of Object.entries(productCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topProductId = productId;
      }
    }
    
    const topProduct = products.find(p => p.id === topProductId);
    const topProductName = topProduct 
      ? `${topProduct.object} ${topProduct.brand}`
      : 'None';
    
    return {
      activeContracts,
      pendingContracts,
      completedContracts,
      cancelledContracts,
      totalRevenue,
      averageDuration,
      topProduct: topProductName
    };
  }, [contracts, products]);

  return (
    <Box className="calendar-page" p="4">
      <Heading size="6" mb="4">Rental Calendar</Heading>
      
      {/* Statistics Cards */}
      <Grid columns="4" gap="4" mb="4">
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Active Rentals</Text>
            <Flex align="baseline" gap="1">
              <Text size="6" weight="bold">{rentalStats.activeContracts}</Text>
              <Badge color="green">Active</Badge>
            </Flex>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Total Revenue</Text>
            <Text size="6" weight="bold">{formatCurrency(rentalStats.totalRevenue)}</Text>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Average Rental Duration</Text>
            <Flex align="baseline" gap="1">
              <Text size="6" weight="bold">{rentalStats.averageDuration.toFixed(1)}</Text>
              <Text size="1" color="gray">days</Text>
            </Flex>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Top Rented Product</Text>
            <Text size="3" weight="bold">{rentalStats.topProduct}</Text>
          </Flex>
        </Card>
      </Grid>
      
      <Flex justify="between" align="center" mb="4">
        <Heading size="4">Calendar View</Heading>
        <Flex gap="4" align="center">
          <Text size="2" weight="bold">Filter by Product:</Text>
          <Select.Root 
            value={selectedProduct} 
            onValueChange={(value) => setSelectedProduct(value)}
          >
            <Select.Trigger placeholder="Select a product" />
            <Select.Content>
              <Select.Item value="all">All Products</Select.Item>
              {products.map(product => (
                <Select.Item key={product.id} value={product.id}>
                  {product.object} - {product.brand} {product.model}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>
      
      <Card style={{ height: 700 }}>
        {loading ? (
          <Text style={{ padding: '1rem' }}>Loading calendar...</Text>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            view={view as any}
            date={date}
            onView={(newView) => setView(newView)}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectEvent={handleEventClick}
            eventPropGetter={eventStyleGetter}
            onRangeChange={handleRangeChange}
          />
        )}
      </Card>
      
      <Box mt="4">
        <Heading size="3" mb="2">Legend</Heading>
        <Flex gap="2" wrap="wrap">
          <Flex align="center" gap="1">
            <Badge color="green">Active</Badge>
            <Text size="1">Active rentals</Text>
          </Flex>
          <Flex align="center" gap="1">
            <Badge color="yellow">Pending</Badge>
            <Text size="1">Pending rentals</Text>
          </Flex>
          <Flex align="center" gap="1">
            <Badge color="blue">Completed</Badge>
            <Text size="1">Completed rentals</Text>
          </Flex>
          <Flex align="center" gap="1">
            <Badge color="red">Cancelled</Badge>
            <Text size="1">Cancelled rentals</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Contract Details Dialog */}
      <Dialog.Root open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedContract && (
          <Dialog.Content style={{ maxWidth: 600 }}>
            <Dialog.Title>Contract Details</Dialog.Title>
            
            <Flex direction="column" gap="4" mt="4">
              <Flex gap="4">
                <Box style={{ flex: 1 }}>
                  <Text size="1" color="gray">Contract ID</Text>
                  <Text weight="bold">{selectedContract.id}</Text>
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text size="1" color="gray">Status</Text>
                  <Badge size="2" color={getStatusBadgeColor(selectedContract.status)}>
                    {selectedContract.status}
                  </Badge>
                </Box>
              </Flex>
              
              <Box>
                <Text size="2" weight="bold" mb="2">Product Information</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Product</Text>
                      <Text size="2">
                        {selectedContract.product?.object} {selectedContract.product?.brand} {selectedContract.product?.model}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Description</Text>
                      <Text size="2">{selectedContract.product?.description}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Security Deposit</Text>
                      <Text size="2">{formatCurrency(selectedContract.product?.cautionDeposit || 0)}</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="2">Renter Information</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Name</Text>
                      <Text size="2">
                        {selectedContract.user?.firstName} {selectedContract.user?.lastName}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Email</Text>
                      <Text size="2">{selectedContract.user?.email}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Phone</Text>
                      <Text size="2">{selectedContract.user?.phoneNumber}</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="2">Rental Period & Payment</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Start Date</Text>
                      <Text size="2">{formatDate(selectedContract.startDate)}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">End Date</Text>
                      <Text size="2">{formatDate(selectedContract.endDate)}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Total Price</Text>
                      <Text size="2">{formatCurrency(selectedContract.totalPrice)}</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
              
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button size="2">Close</Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Content>
        )}
      </Dialog.Root>
    </Box>
  );
};

export default CalendarPage;