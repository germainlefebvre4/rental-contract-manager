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
  TextField,
  Select,
  Separator,
  DropdownMenu
} from '@radix-ui/themes';
import { getContracts, createContract, getProducts, getUsers } from '../../services/api';
import { generatePDF } from '../../services/pdf';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Contract, Product, User, ContractPDFData } from '../../types';

const ContractPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    productId: '',
    userId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending'
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsData, productsData, usersData] = await Promise.all([
        getContracts(),
        getProducts(),
        getUsers()
      ]);
      
      const enhancedContracts = contractsData.map((contract: Contract) => {
        const product = productsData.find((p: Product) => p.id === contract.productId);
        const user = usersData.find((u: User) => u.id === contract.userId);
        return { ...contract, product, user };
      });
      
      setContracts(enhancedContracts);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContract(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (value: string) => {
    console.log('Product selected:', value);
    setNewContract(prev => ({
      ...prev,
      productId: value || ''
    }));
  };

  const handleUserChange = (value: string) => {
    console.log('User selected:', value);
    setNewContract(prev => ({
      ...prev,
      userId: value || ''
    }));
  };

  const handleStatusChange = (value: string) => {
    setNewContract(prev => ({
      ...prev,
      status: value || 'Pending'
    }));
  };

  const handleDateChange = (type: 'startDate' | 'endDate', date: string) => {
    setNewContract(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const calculateTotalPrice = (productId: string, startDate: string, endDate: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    return (weeks * product.pricePerWeek) + (remainingDays * product.pricePerDay);
  };

  const handleSubmit = async () => {
    try {
      const errors: Record<string, string> = {};
      if (!newContract.productId) errors.productId = 'Product is required';
      if (!newContract.userId) errors.userId = 'User is required';
      if (!newContract.startDate) errors.startDate = 'Start date is required';
      if (!newContract.endDate) errors.endDate = 'End date is required';
      
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }
      
      const totalPrice = calculateTotalPrice(
        newContract.productId as string, 
        newContract.startDate as string, 
        newContract.endDate as string
      );

      // Set startDate as datetime
      const startDate = new Date(newContract.startDate as string);
      const endDate = new Date(newContract.endDate as string);
      newContract.startDate = startDate.toISOString();
      newContract.endDate = endDate.toISOString();
      
      const contractData = {
        ...newContract,
        totalPrice
      };
      
      setErrors({});
      const response = await createContract(contractData);
      
      const product = products.find(p => p.id === response.productId);
      const user = users.find(u => u.id === response.userId);
      
      setContracts(prev => [...prev, { ...response, product, user }]);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const resetForm = () => {
    setNewContract({
      productId: '',
      userId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending'
    });
    setErrors({});
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };

  const handleGeneratePDF = () => {
    if (!selectedContract || !selectedContract.product || !selectedContract.user) return;
    
    // Get current date in a readable format
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    const contractData: ContractPDFData = {
      // Contract ID
      contractId: selectedContract.id,
      // Product information
      object: selectedContract.product.object,
      brand: selectedContract.product.brand,
      model: selectedContract.product.model,
      quantity: 1,
      description: selectedContract.product.description,
      precautions: "Handle with care. Return in same condition as received.",
      pricePerDay: selectedContract.product.pricePerDay,
      pricePerWeek: selectedContract.product.pricePerWeek,
      deposit: selectedContract.product.cautionDeposit,
      // User information
      renterName: `${selectedContract.user.firstName} ${selectedContract.user.lastName}`,
      renterEmail: selectedContract.user.email,
      renterPhone: selectedContract.user.phoneNumber,
      renterAddress: selectedContract.user.postalAddress,
      renterCity: selectedContract.user.city,
      // Contract details
      totalAmount: selectedContract.totalPrice,
      stateBefore: "Good condition",
      stateAfter: "",
      usageDate: `${formatDate(selectedContract.startDate)} to ${formatDate(selectedContract.endDate)}`,
      retrievalDates: formatDate(selectedContract.endDate),
      // Additional fields
      currentDate: currentDate,
      city: selectedContract.user.city || "Your City"
    };
    
    generatePDF(contractData);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Pending': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatId = (id: any): string => {
    if (!id) return 'N/A';
    const idString = String(id);
    return idString.length > 8 ? `${idString.substring(0, 8)}...` : idString;
  };

  return (
    <Box className="contract-page" p="4">
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Contract Management</Heading>
        <Button onClick={() => setDialogOpen(true)}>Create New Contract</Button>
      </Flex>
      
      <Card>
        {loading ? (
          <Text>Loading contracts...</Text>
        ) : (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Renter</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Period</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {contracts.length > 0 ? (
                contracts.map((contract) => (
                  <Table.Row key={contract.id}>
                    <Table.Cell>{formatId(contract.id)}</Table.Cell>
                    <Table.Cell>
                      {contract.product 
                        ? `${contract.product.object} ${contract.product.brand}` 
                        : 'Unknown Product'}
                    </Table.Cell>
                    <Table.Cell>
                      {contract.user 
                        ? `${contract.user.firstName} ${contract.user.lastName}` 
                        : 'Unknown User'}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </Table.Cell>
                    <Table.Cell>{formatCurrency(contract.totalPrice)}</Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusBadgeColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button variant="soft" size="1" onClick={() => handleViewContract(contract)}>
                          View
                        </Button>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <Button variant="soft" size="1">
                              Actions
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
                            <DropdownMenu.Item key="edit">Edit</DropdownMenu.Item>
                            <DropdownMenu.Item key="change-status">Change Status</DropdownMenu.Item>
                            <DropdownMenu.Item key="generate-pdf" onClick={() => handleViewContract(contract)}>
                              Generate PDF
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item key="cancel" color="red">Cancel</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text align="center">No contracts available</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        )}
      </Card>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Create New Rental Contract</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Fill in the details to create a new rental contract.
          </Dialog.Description>
          
          <Flex direction="column" gap="3">
            <Box>
              <label htmlFor="productId">
                <Text as="div" size="2" mb="1" weight="bold">
                  Product
                </Text>
              </label>
              <Select.Root 
                value={newContract.productId} 
                onValueChange={handleProductChange}
                defaultValue=""
              >
                <Select.Trigger placeholder="Select a product" />
                <Select.Content position="popper">
                  {products.map(product => (
                    <Select.Item key={product.id} value={product.id}>
                      {product.object} - {product.brand} {product.model}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {errors.productId && <Text color="red" size="1">{errors.productId}</Text>}
            </Box>
            
            <Box>
              <label htmlFor="userId">
                <Text as="div" size="2" mb="1" weight="bold">
                  Renter
                </Text>
              </label>
              <Select.Root 
                value={newContract.userId} 
                onValueChange={handleUserChange}
                defaultValue=""
              >
                <Select.Trigger placeholder="Select a renter" />
                <Select.Content position="popper">
                  {users.map(user => (
                    <Select.Item key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {errors.userId && <Text color="red" size="1">{errors.userId}</Text>}
            </Box>
            
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="startDate">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Start Date
                  </Text>
                </label>
                <TextField.Root 
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newContract.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
                {errors.startDate && <Text color="red" size="1">{errors.startDate}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="endDate">
                  <Text as="div" size="2" mb="1" weight="bold">
                    End Date
                  </Text>
                </label>
                <TextField.Root 
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={newContract.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
                {errors.endDate && <Text color="red" size="1">{errors.endDate}</Text>}
              </Box>
            </Flex>
            
            <Box>
              <label htmlFor="status">
                <Text as="div" size="2" mb="1" weight="bold">
                  Status
                </Text>
              </label>
              <Select.Root 
                value={newContract.status || 'Pending'}
                onValueChange={handleStatusChange}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item key="pending" value="Pending">Pending</Select.Item>
                  <Select.Item key="active" value="Active">Active</Select.Item>
                  <Select.Item key="completed" value="Completed">Completed</Select.Item>
                  <Select.Item key="cancelled" value="Cancelled">Cancelled</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            
            {newContract.productId && newContract.startDate && newContract.endDate && (
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  Estimated Total Price
                </Text>
                <Text weight="bold">
                  {formatCurrency(
                    calculateTotalPrice(
                      newContract.productId,
                      newContract.startDate,
                      newContract.endDate
                    )
                  )}
                </Text>
              </Box>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={resetForm}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSubmit}>
              Create Contract
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      
      <Dialog.Root open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
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
              
              <Separator size="4" />
              
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
                    <Flex justify="between">
                      <Text size="2" color="gray">Address</Text>
                      <Text size="2">{selectedContract.user?.postalAddress}, {selectedContract.user?.city}</Text>
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
                      <Text size="2" color="gray">Total Amount</Text>
                      <Text size="2" weight="bold">{formatCurrency(selectedContract.totalPrice)}</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
            </Flex>
            
            <Flex gap="3" mt="4" justify="end">
              <Button variant="soft" onClick={handleGeneratePDF}>
                Generate PDF
              </Button>
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        )}
      </Dialog.Root>
    </Box>
  );
};

export default ContractPage;