import React, { useState, useEffect } from 'react';
import { 
  Heading, 
  Box, 
  Card, 
  Table, 
  Text, 
  Badge, 
  Button, 
  Dialog,
  Flex,
  Grid,
  Avatar,
  Separator,
  ScrollArea
} from '@radix-ui/themes';
import { getProducts, getContracts } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Product, Contract } from '../../types';

const RenterPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [myRentals, setMyRentals] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetailsOpen, setProductDetailsOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'available' | 'my-rentals'>('available');

  // Mock user ID - in a real app, this would come from authentication
  const currentUserId = "user123";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, contractsData] = await Promise.all([
        getProducts(),
        getContracts()
      ]);
      
      // Mark products as available if not rented
      const rentedProductIds = contractsData
        .filter((contract: Contract) => contract.status === 'Active')
        .map((contract: Contract) => contract.productId);
      
      const enhancedProducts = productsData.map((product: Product) => ({
        ...product,
        status: rentedProductIds.includes(product.id) ? 'Rented' : 'Available'
      }));
      
      // Get user's rentals
      const userRentals = contractsData
        .filter((contract: Contract) => contract.userId === currentUserId)
        .map((contract: Contract) => {
          // Enhance contracts with product details
          const product = productsData.find((p: Product) => p.id === contract.productId);
          return { ...contract, product };
        });
      
      setProducts(enhancedProducts);
      setMyRentals(userRentals);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailsOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Rented': return 'amber';
      default: return 'gray';
    }
  };

  const getRentalStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Pending': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box className="renter-page" p="4">
      <Heading size="6" mb="4">Renter Dashboard</Heading>
      
      <Flex mb="4">
        <Button 
          variant={currentView === 'available' ? 'solid' : 'soft'} 
          mr="2"
          onClick={() => setCurrentView('available')}
        >
          Available Products
        </Button>
        <Button 
          variant={currentView === 'my-rentals' ? 'solid' : 'soft'} 
          onClick={() => setCurrentView('my-rentals')}
        >
          My Rentals
        </Button>
      </Flex>
      
      {currentView === 'available' ? (
        <>
          <Text mb="2">Browse available items for rent:</Text>
          
          {loading ? (
            <Text>Loading products...</Text>
          ) : (
            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              {products
                .filter(product => product.status === 'Available')
                .map(product => (
                  <Card key={product.id}>
                    <Flex direction="column" gap="3">
                      <Box height="150px" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text size="2" color="gray">Product Image</Text>
                      </Box>
                      
                      <Flex justify="between">
                        <Box>
                          <Text weight="bold">{product.object}</Text>
                          <Text size="2" color="gray">{product.brand} {product.model}</Text>
                        </Box>
                        <Badge color={getStatusBadgeColor(product.status || 'Available')}>
                          {product.status || 'Available'}
                        </Badge>
                      </Flex>
                      
                      <Text size="1" style={{ height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.description}
                      </Text>
                      
                      <Separator size="4" />
                      
                      <Flex justify="between" align="center">
                        <Box>
                          <Text weight="bold">{formatCurrency(product.pricePerDay)}</Text>
                          <Text size="1">per day</Text>
                        </Box>
                        <Button size="2" onClick={() => viewProductDetails(product)}>View Details</Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              
              {products.filter(product => product.status === 'Available').length === 0 && (
                <Card style={{ gridColumn: '1 / -1' }}>
                  <Text align="center">No available products found</Text>
                </Card>
              )}
            </Grid>
          )}
        </>
      ) : (
        <>
          <Text mb="2">Your current and past rentals:</Text>
          
          {loading ? (
            <Text>Loading rentals...</Text>
          ) : (
            <Card>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Period</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {myRentals.length > 0 ? (
                    myRentals.map((rental) => (
                      <Table.Row key={rental.id}>
                        <Table.Cell>
                          {rental.product 
                            ? `${rental.product.object} ${rental.product.brand}`
                            : 'Unknown Product'
                          }
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </Table.Cell>
                        <Table.Cell>{formatCurrency(rental.totalPrice)}</Table.Cell>
                        <Table.Cell>
                          <Badge color={getRentalStatusBadgeColor(rental.status)}>
                            {rental.status}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={4}>
                        <Text align="center">You have no rentals yet</Text>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Card>
          )}
        </>
      )}
      
      {/* Product Details Dialog */}
      <Dialog.Root open={productDetailsOpen} onOpenChange={setProductDetailsOpen}>
        {selectedProduct && (
          <Dialog.Content style={{ maxWidth: 500 }}>
            <Dialog.Title>{selectedProduct.object}</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              {selectedProduct.brand} {selectedProduct.model}
            </Dialog.Description>
            
            <Box height="200px" mb="4" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text size="2" color="gray">Product Image</Text>
            </Box>
            
            <Flex direction="column" gap="3">
              <Box>
                <Text weight="bold" size="2">Description</Text>
                <Text size="2">{selectedProduct.description}</Text>
              </Box>
              
              <Separator size="4" />
              
              <Flex justify="between">
                <Box>
                  <Text weight="bold" size="2">Price Per Day</Text>
                  <Text>{formatCurrency(selectedProduct.pricePerDay)}</Text>
                </Box>
                <Box>
                  <Text weight="bold" size="2">Price Per Week</Text>
                  <Text>{formatCurrency(selectedProduct.pricePerWeek)}</Text>
                </Box>
              </Flex>
              
              <Box>
                <Text weight="bold" size="2">Security Deposit</Text>
                <Text>{formatCurrency(selectedProduct.cautionDeposit)}</Text>
              </Box>
              
              <Box>
                <Badge color={getStatusBadgeColor(selectedProduct.status || 'Available')} size="2">
                  {selectedProduct.status || 'Available'}
                </Badge>
              </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Button>Request to Rent</Button>
              <Dialog.Close>
                <Button variant="soft" color="gray">Close</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        )}
      </Dialog.Root>
    </Box>
  );
};

export default RenterPage;