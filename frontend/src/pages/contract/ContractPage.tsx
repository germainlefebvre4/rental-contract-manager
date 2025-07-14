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
import { getContracts, createContract, getProducts, getUsers, createUser } from '../../services/api';
import { generatePDF } from '../../services/pdf';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Contract, Product, User, ContractPDFData } from '../../types';

const ContractPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [newContract, setNewContract] = useState<Partial<Contract>>(() => {
    // Initialize dates
    const usageStartDate = new Date().toISOString().split('T')[0];
    const usageEndDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const retrievalEndDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      productId: '',
      startDate: usageStartDate,
      endDate: usageEndDate,
      retrievalStartDate: usageStartDate,  // Same as usage start date
      retrievalEndDate: retrievalEndDate,  // One day after usage end date
      status: 'Pending'
    };
  });
  const [newRenter, setNewRenter] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    postalAddress: '',
    city: '',
    birthDate: '',
    phoneNumber: '',
    kind: 'renter'
  });
  const [errors, setErrors] = useState<any>({});
  const [renterErrors, setRenterErrors] = useState<any>({});

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
      setFilteredContracts(enhancedContracts);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts based on search queries
  const filterContracts = () => {
    let result = [...contracts];
    
    // Filter by product name
    if (productSearchQuery) {
      const lowerProductQuery = productSearchQuery.toLowerCase();
      result = result.filter(contract => 
        contract.product && (
          contract.product.object.toLowerCase().includes(lowerProductQuery) ||
          contract.product.brand.toLowerCase().includes(lowerProductQuery) ||
          contract.product.model.toLowerCase().includes(lowerProductQuery)
        )
      );
    }
    
    // Filter by user details
    if (userSearchQuery) {
      const lowerUserQuery = userSearchQuery.toLowerCase();
      result = result.filter(contract => 
        contract.user && (
          contract.user.firstName.toLowerCase().includes(lowerUserQuery) ||
          contract.user.lastName.toLowerCase().includes(lowerUserQuery) ||
          contract.user.email.toLowerCase().includes(lowerUserQuery)
        )
      );
    }
    
    setFilteredContracts(result);
  };
  
  // Update filters when search queries change
  useEffect(() => {
    filterContracts();
  }, [productSearchQuery, userSearchQuery, contracts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContract(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRenter(prev => ({
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

  const handleStatusChange = (value: string) => {
    setNewContract(prev => ({
      ...prev,
      status: value || 'Pending'
    }));
  };

  const handleDateChange = (type: 'startDate' | 'endDate' | 'retrievalStartDate' | 'retrievalEndDate', date: string) => {
    setNewContract(prev => {
      // Create updated contract state
      const updatedContract = {
        ...prev,
        [type]: date
      };
      
      // If usage start date changes, update retrieval start date to match
      if (type === 'startDate') {
        updatedContract.retrievalStartDate = date;
      }
      
      // If usage end date changes, update retrieval end date to match
      if (type === 'endDate') {
        // Set retrieval end date to be the day after usage end date
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate());
        updatedContract.retrievalEndDate = endDate.toISOString().split('T')[0];
      }
      
      return updatedContract;
    });
  };

  const calculateTotalPrice = (productId: string, startDate: string, endDate: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    // Use the helper function for consistency
    const days = calculateRentalDuration(startDate, endDate);
    
    if (days <= 0) return 0;
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    return (weeks * product.pricePerWeek) + (remainingDays * product.pricePerDay);
  };

  const validateRenterInput = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!newRenter.firstName) errors.firstName = 'First name is required';
    if (!newRenter.lastName) errors.lastName = 'Last name is required';
    // if (!newRenter.email) errors.email = 'Email is required';
    // if (!newRenter.postalAddress) errors.postalAddress = 'Postal address is required';
    // if (!newRenter.city) errors.city = 'City is required';
    // if (!newRenter.phoneNumber) errors.phoneNumber = 'Phone number is required';
    return errors;
  };

  const handleSubmit = async () => {
    try {
      // Validate contract fields
      const contractErrors: Record<string, string> = {};
      if (!newContract.productId) contractErrors.productId = 'Product is required';
      if (!newContract.startDate) contractErrors.startDate = 'Usage start date is required';
      if (!newContract.endDate) contractErrors.endDate = 'Usage end date is required';
      if (!newContract.retrievalStartDate) contractErrors.retrievalStartDate = 'Retrieval start date is required';
      if (!newContract.retrievalEndDate) contractErrors.retrievalEndDate = 'Retrieval end date is required';
      
      // Validate renter fields
      const renterFormErrors = validateRenterInput();
      
      // Check for validation errors
      if (Object.keys(contractErrors).length > 0) {
        setErrors(contractErrors);
        return;
      }
      
      if (Object.keys(renterFormErrors).length > 0) {
        setRenterErrors(renterFormErrors);
        return;
      }
      
      const totalPrice = calculateTotalPrice(
        newContract.productId as string, 
        newContract.startDate as string, 
        newContract.endDate as string
      );

      // Calculate rental duration in days using the helper function
      const durationInDays = calculateRentalDuration(
        newContract.startDate as string,
        newContract.endDate as string
      );

      // Set all dates as datetime
      const start = new Date(newContract.startDate as string);
      const end = new Date(newContract.endDate as string);
      const retrievalStartDate = new Date(newContract.retrievalStartDate as string);
      const retrievalEndDate = new Date(newContract.retrievalEndDate as string);
      
      newContract.startDate = start.toISOString();
      newContract.endDate = end.toISOString();
      newContract.retrievalStartDate = retrievalStartDate.toISOString();
      newContract.retrievalEndDate = retrievalEndDate.toISOString();
      
      // Create contract data
      const contractData = {
        ...newContract,
        totalPrice,
        totalAmount: totalPrice, // For backend database mapping
        durationDays: durationInDays, // Frontend property
        rentalDuration: durationInDays // Backend property
      };
      
      setErrors({});
      setRenterErrors({});
      
      // Create both user and contract in a single API call
      const contractResponse = await createContract(contractData, newRenter);
      
      // Find the product for the contract
      const product = products.find(p => p.id === contractResponse.productId);
      
      // Get the user from the response or create a representation
      // The backend should have created the user and returned it with the contract
      let user: User;
      if (contractResponse.user) {
        user = contractResponse.user;
      } else {
        // Ensure all required fields are present and not undefined
        user = {
          id: contractResponse.userId,
          firstName: newRenter.firstName || '',
          lastName: newRenter.lastName || '',
          email: newRenter.email || '',
          postalAddress: newRenter.postalAddress || '',
          city: newRenter.city || '',
          phoneNumber: newRenter.phoneNumber || '',
          kind: newRenter.kind as 'admin' | 'renter' || 'renter'
        };
        if (newRenter.birthDate) {
          user.birthDate = newRenter.birthDate;
        }
      }
      
      // Add the new contract to the list with product and user info
      setContracts(prev => [...prev, { 
        ...contractResponse, 
        product, 
        user 
      }]);
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating contract and renter:', error);
    }
  };

  const resetForm = () => {
    // Initialize dates
    const usageStartDate = new Date().toISOString().split('T')[0];
    const usageEndDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const retrievalEndDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setNewContract({
      productId: '',
      startDate: usageStartDate,
      endDate: usageEndDate,
      retrievalStartDate: usageStartDate,  // Same as usage start date
      retrievalEndDate: retrievalEndDate,  // One day after usage end date
      status: 'Pending'
    });
    setNewRenter({
      firstName: '',
      lastName: '',
      email: '',
      postalAddress: '',
      city: '',
      birthDate: '',
      phoneNumber: '',
      kind: 'renter'
    });
    setErrors({});
    setRenterErrors({});
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
      totalAmount: selectedContract.totalPrice || selectedContract.totalAmount || 0,
      durationDays: selectedContract.durationDays || calculateRentalDuration(selectedContract.startDate, selectedContract.endDate),
      stateBefore: "Good condition",
      stateAfter: "",
      usageDate: `${formatDate(selectedContract.startDate)} to ${formatDate(selectedContract.endDate)}`,
      retrievalDates: selectedContract.retrievalStartDate && selectedContract.retrievalEndDate ? 
        `${formatDate(selectedContract.retrievalStartDate)} to ${formatDate(selectedContract.retrievalEndDate)}` :
        formatDate(selectedContract.endDate),
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

  // Helper function to calculate rental duration
  const calculateRentalDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Box className="contract-page" p="4">
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Contract Management</Heading>
        <Button onClick={() => setDialogOpen(true)}>Create New Contract</Button>
      </Flex>
      
      <Flex gap="4" mb="4">
        <Box style={{ flex: 1 }}>
          <TextField.Root>
            <input
              placeholder="Search by product name..." 
              value={productSearchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </TextField.Root>
        </Box>
        <Box style={{ flex: 1 }}>
          <TextField.Root>
            <input
              placeholder="Search by renter name or email..." 
              value={userSearchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </TextField.Root>
        </Box>
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
                <Table.ColumnHeaderCell>Usage Period</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Retrieval Period</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
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
                    <Table.Cell>
                      {contract.durationDays || calculateRentalDuration(contract.startDate, contract.endDate)} day(s)
                    </Table.Cell>
                    <Table.Cell>
                      {contract.retrievalStartDate && contract.retrievalEndDate 
                        ? `${formatDate(contract.retrievalStartDate)} - ${formatDate(contract.retrievalEndDate)}`
                        : 'Not specified'}
                    </Table.Cell>
                    <Table.Cell>{formatCurrency(contract.totalPrice || contract.totalAmount || 0)}</Table.Cell>
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
                  <Table.Cell colSpan={8}>
                    <Text align="center">No contracts available</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        )}
      </Card>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content style={{ maxWidth: 700 }}>
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
              <Text as="div" size="2" mb="3" weight="bold">
                Renter Information
              </Text>
              
              <Flex direction="column" gap="3">
                <Flex gap="3">
                  <Box style={{ flex: 1 }}>
                    <label htmlFor="firstName">
                      <Text as="div" size="2" mb="1" weight="bold">
                        First Name
                      </Text>
                    </label>
                    <TextField.Root 
                      id="firstName" 
                      name="firstName"
                      value={newRenter.firstName}
                      onChange={handleRenterInputChange}
                      placeholder="Enter first name"
                    />
                    {renterErrors.firstName && <Text color="red" size="1">{renterErrors.firstName}</Text>}
                  </Box>
                  
                  <Box style={{ flex: 1 }}>
                    <label htmlFor="lastName">
                      <Text as="div" size="2" mb="1" weight="bold">
                        Last Name
                      </Text>
                    </label>
                    <TextField.Root 
                      id="lastName" 
                      name="lastName"
                      value={newRenter.lastName}
                      onChange={handleRenterInputChange}
                      placeholder="Enter last name"
                    />
                    {renterErrors.lastName && <Text color="red" size="1">{renterErrors.lastName}</Text>}
                  </Box>
                </Flex>
                
                <Box>
                  <label htmlFor="email">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Email
                    </Text>
                  </label>
                  <TextField.Root 
                    id="email" 
                    name="email"
                    type="email"
                    value={newRenter.email}
                    onChange={handleRenterInputChange}
                    placeholder="Enter email address"
                  />
                  {renterErrors.email && <Text color="red" size="1">{renterErrors.email}</Text>}
                </Box>
                
                <Box>
                  <label htmlFor="phoneNumber">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Phone Number
                    </Text>
                  </label>
                  <TextField.Root 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={newRenter.phoneNumber}
                    onChange={handleRenterInputChange}
                    placeholder="Enter phone number"
                  />
                  {renterErrors.phoneNumber && <Text color="red" size="1">{renterErrors.phoneNumber}</Text>}
                </Box>

                <Box>
                  <label htmlFor="postalAddress">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Postal Address
                    </Text>
                  </label>
                  <TextField.Root 
                    id="postalAddress" 
                    name="postalAddress"
                    value={newRenter.postalAddress}
                    onChange={handleRenterInputChange}
                    placeholder="Enter postal address"
                  />
                  {renterErrors.postalAddress && <Text color="red" size="1">{renterErrors.postalAddress}</Text>}
                </Box>

                <Box>
                  <label htmlFor="city">
                    <Text as="div" size="2" mb="1" weight="bold">
                      City
                    </Text>
                  </label>
                  <TextField.Root 
                    id="city" 
                    name="city"
                    value={newRenter.city}
                    onChange={handleRenterInputChange}
                    placeholder="Enter city"
                  />
                  {renterErrors.city && <Text color="red" size="1">{renterErrors.city}</Text>}
                </Box>
                
                <Box>
                  <label htmlFor="birthDate">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Birth Date
                    </Text>
                  </label>
                  <TextField.Root 
                    id="birthDate" 
                    name="birthDate"
                    type="date"
                    value={newRenter.birthDate}
                    onChange={handleRenterInputChange}
                  />
                  {renterErrors.birthDate && <Text color="red" size="1">{renterErrors.birthDate}</Text>}
                </Box>
              </Flex>

              <Separator size="4" my="3" />
            </Box>
            
            <Text as="div" size="3" mb="2" weight="bold">Usage Period</Text>
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="startDate">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Usage Start Date
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
                    Usage End Date
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

            <Text as="div" size="3" mt="4" mb="2" weight="bold">Retrieval Period</Text>
            <Text as="div" size="1" mb="2" color="gray">
              Retrieval dates are automatically updated when you change the usage dates, but you can adjust them if needed.
            </Text>
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="retrievalStartDate">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Retrieval Start Date
                  </Text>
                </label>
                <TextField.Root 
                  id="retrievalStartDate"
                  name="retrievalStartDate"
                  type="date"
                  value={newContract.retrievalStartDate || ''}
                  onChange={(e) => handleDateChange('retrievalStartDate', e.target.value)}
                />
                {errors.retrievalStartDate && <Text color="red" size="1">{errors.retrievalStartDate}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="retrievalEndDate">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Retrieval End Date
                  </Text>
                </label>
                <TextField.Root 
                  id="retrievalEndDate"
                  name="retrievalEndDate"
                  type="date"
                  value={newContract.retrievalEndDate || ''}
                  onChange={(e) => handleDateChange('retrievalEndDate', e.target.value)}
                />
                {errors.retrievalEndDate && <Text color="red" size="1">{errors.retrievalEndDate}</Text>}
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
                  Rental Summary
                </Text>
                <Flex direction="column" gap="1">
                  <Text weight="bold">
                    {formatCurrency(
                      calculateTotalPrice(
                        newContract.productId,
                        newContract.startDate,
                        newContract.endDate
                      )
                    )}
                  </Text>
                  <Text size="1" color="gray">
                    Duration: {calculateRentalDuration(newContract.startDate, newContract.endDate)} day(s)
                  </Text>
                </Flex>
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
                <Text size="2" weight="bold" mb="2">Usage Period</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Usage Start Date</Text>
                      <Text size="2">{formatDate(selectedContract.startDate)}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Usage End Date</Text>
                      <Text size="2">{formatDate(selectedContract.endDate)}</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="2">Retrieval Period</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Retrieval Start Date</Text>
                      <Text size="2">
                        {selectedContract.retrievalStartDate ? formatDate(selectedContract.retrievalStartDate) : 'Not specified'}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Retrieval End Date</Text>
                      <Text size="2">
                        {selectedContract.retrievalEndDate ? formatDate(selectedContract.retrievalEndDate) : 'Not specified'}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="2">Payment</Text>
                <Card variant="surface">
                  <Flex gap="3" direction="column">
                    <Flex justify="between">
                      <Text size="2" color="gray">Total Amount</Text>
                      <Text size="2" weight="bold">{formatCurrency(selectedContract.totalPrice || selectedContract.totalAmount || 0)}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2" color="gray">Rental Duration</Text>
                      <Text size="2">
                        {selectedContract.durationDays || calculateRentalDuration(selectedContract.startDate, selectedContract.endDate)} 
                        day{(selectedContract.durationDays || calculateRentalDuration(selectedContract.startDate, selectedContract.endDate)) !== 1 ? 's' : ''}
                      </Text>
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