import React, { useState, useEffect } from 'react';
import { 
  Heading, 
  Tabs, 
  Box, 
  Card, 
  Table, 
  Text, 
  Badge, 
  Button, 
  Separator,
  TextField,
  Dialog,
  Flex,
  Switch,
  Avatar,
  Select
} from '@radix-ui/themes';
import { getProducts, createProduct, updateProduct, deleteProduct, getUsers, createUser } from '../../services/api';
import { validateProductInput, validateUserInput } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';
import { Product, User } from '../../types';

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    object: '',
    brand: '',
    model: '',
    quantity: 1,
    description: '',
    pricePerDay: 0,
    pricePerWeek: 0,
    cautionDeposit: 0
  });
  const [editProduct, setEditProduct] = useState<Partial<Product>>({
    object: '',
    brand: '',
    model: '',
    quantity: 1,
    description: '',
    pricePerDay: 0,
    pricePerWeek: 0,
    cautionDeposit: 0
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
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
  const [editErrors, setEditErrors] = useState<any>({});
  const [userErrors, setUserErrors] = useState<any>({});

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (['quantity', 'pricePerDay', 'pricePerWeek', 'cautionDeposit'].includes(name)) {
      setNewProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (['quantity', 'pricePerDay', 'pricePerWeek', 'cautionDeposit'].includes(name)) {
      setEditProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setEditProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserKindChange = (value: string) => {
    setNewUser(prev => ({
      ...prev,
      kind: value as 'admin' | 'renter'
    }));
  };

  const handleSubmit = async () => {
    try {
      const validation = validateProductInput(newProduct as any);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
      
      setErrors({});
      const response = await createProduct(newProduct);
      setProducts(prev => [...prev, response]);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUserSubmit = async () => {
    try {
      const validation = validateUserInput ? validateUserInput(newUser as any) : { isValid: true, errors: {} };
      
      if (!validation.isValid) {
        setUserErrors(validation.errors);
        return;
      }
      
      setUserErrors({});
      const response = await createUser(newUser);
      setUsers(prev => [...prev, response]);
      setUserDialogOpen(false);
      resetUserForm();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      object: product.object,
      brand: product.brand,
      model: product.model,
      quantity: product.quantity,
      description: product.description,
      pricePerDay: product.pricePerDay,
      pricePerWeek: product.pricePerWeek,
      cautionDeposit: product.cautionDeposit
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const validation = validateProductInput(editProduct as any);
      
      if (!validation.isValid) {
        setEditErrors(validation.errors);
        return;
      }
      
      setEditErrors({});
      const response = await updateProduct(selectedProduct.id, editProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? response : p));
      setEditDialogOpen(false);
      resetEditForm();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setNewProduct({
      object: '',
      brand: '',
      model: '',
      quantity: 1,
      description: '',
      pricePerDay: 0,
      pricePerWeek: 0,
      cautionDeposit: 0
    });
    setErrors({});
  };

  const resetEditForm = () => {
    setEditProduct({
      object: '',
      brand: '',
      model: '',
      quantity: 1,
      description: '',
      pricePerDay: 0,
      pricePerWeek: 0,
      cautionDeposit: 0
    });
    setEditErrors({});
    setSelectedProduct(null);
  };

  const resetUserForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      postalAddress: '',
      city: '',
      birthDate: '',
      phoneNumber: '',
      kind: 'renter'
    });
    setUserErrors({});
  };

  return (
    <Box className="admin-page" p="4">
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Admin Dashboard</Heading>
        <Button onClick={() => setDialogOpen(true)}>Add New Product</Button>
      </Flex>
      
      <Tabs.Root defaultValue="products">
        <Tabs.List>
          <Tabs.Trigger value="products">Products</Tabs.Trigger>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
        </Tabs.List>
        
        <Box pt="4">
          <Tabs.Content value="products">
            <Card>
              {loading ? (
                <Text>Loading products...</Text>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Object</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Brand / Model</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Daily Price</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Weekly Price</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  
                  <Table.Body>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <Table.Row key={product.id}>
                          <Table.Cell>{product.object}</Table.Cell>
                          <Table.Cell>
                            {product.brand} {product.model}
                          </Table.Cell>
                          <Table.Cell>{product.quantity}</Table.Cell>
                          <Table.Cell>{formatCurrency(product.pricePerDay)}</Table.Cell>
                          <Table.Cell>{formatCurrency(product.pricePerWeek)}</Table.Cell>
                          <Table.Cell>
                            <Badge color={product.status === 'Available' ? 'green' : 'amber'}>
                              {product.status || 'Available'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="2">
                              <Button 
                                size="1" 
                                variant="soft" 
                                color="blue"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="1" 
                                variant="soft" 
                                color="red"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                Delete
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={7}>
                          <Text align="center">No products available</Text>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              )}
            </Card>
          </Tabs.Content>
          
          <Tabs.Content value="users">
            <Card>
              {usersLoading ? (
                <Text>Loading users...</Text>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>First Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Last Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Phone Number</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Kind</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  
                  <Table.Body>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <Table.Row key={user.id}>
                          <Table.Cell>{user.firstName}</Table.Cell>
                          <Table.Cell>{user.lastName}</Table.Cell>
                          <Table.Cell>{user.email}</Table.Cell>
                          <Table.Cell>{user.phoneNumber}</Table.Cell>
                          <Table.Cell>
                            <Badge color={user.kind === 'admin' ? 'blue' : 'green'}>
                              {user.kind}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={5}>
                          <Text align="center">No users available</Text>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              )}
            </Card>
          </Tabs.Content>
          
          <Tabs.Content value="analytics">
            <Card>
              <Text>Analytics dashboard will be implemented here.</Text>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Add New Product</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Fill in the details to add a new rental product.
          </Dialog.Description>
          
          <Flex direction="column" gap="3">
            <Box>
              <label htmlFor="object">
                <Text as="div" size="2" mb="1" weight="bold">
                  Object Name
                </Text>
              </label>
              <TextField.Root 
                id="object" 
                name="object"
                value={newProduct.object}
                onChange={handleInputChange}
                placeholder="Enter the object name"
              />
              {errors.object && <Text color="red" size="1">{errors.object}</Text>}
            </Box>
            
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="brand">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Brand
                  </Text>
                </label>
                <TextField.Root 
                  id="brand" 
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand"
                />
                {errors.brand && <Text color="red" size="1">{errors.brand}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="model">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Model
                  </Text>
                </label>
                <TextField.Root 
                  id="model" 
                  name="model"
                  value={newProduct.model}
                  onChange={handleInputChange}
                  placeholder="Enter model"
                />
                {errors.model && <Text color="red" size="1">{errors.model}</Text>}
              </Box>
            </Flex>
            
            <Box>
              <label htmlFor="quantity">
                <Text as="div" size="2" mb="1" weight="bold">
                  Quantity
                </Text>
              </label>
              <TextField.Root 
                id="quantity" 
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
              />
              {errors.quantity && <Text color="red" size="1">{errors.quantity}</Text>}
            </Box>
            
            <Box>
              <label htmlFor="description">
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
              </label>
              <TextField.Root 
                id="description" 
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
              />
              {errors.description && <Text color="red" size="1">{errors.description}</Text>}
            </Box>

            <Separator size="4" />
            
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="pricePerDay">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Daily Price
                  </Text>
                </label>
                <TextField.Root 
                  id="pricePerDay" 
                  name="pricePerDay"
                  type="number"
                  value={newProduct.pricePerDay}
                  onChange={handleInputChange}
                />
                {errors.pricePerDay && <Text color="red" size="1">{errors.pricePerDay}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="pricePerWeek">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Weekly Price
                  </Text>
                </label>
                <TextField.Root 
                  id="pricePerWeek" 
                  name="pricePerWeek"
                  type="number"
                  value={newProduct.pricePerWeek}
                  onChange={handleInputChange}
                />
                {errors.pricePerWeek && <Text color="red" size="1">{errors.pricePerWeek}</Text>}
              </Box>
            </Flex>
            
            <Box>
              <label htmlFor="cautionDeposit">
                <Text as="div" size="2" mb="1" weight="bold">
                  Security Deposit
                </Text>
              </label>
              <TextField.Root 
                id="cautionDeposit" 
                name="cautionDeposit"
                type="number"
                value={newProduct.cautionDeposit}
                onChange={handleInputChange}
              />
              {errors.cautionDeposit && <Text color="red" size="1">{errors.cautionDeposit}</Text>}
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={resetForm}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSubmit}>
              Add Product
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Add New User</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Fill in the details to add a new user.
          </Dialog.Description>
          
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
                  value={newUser.firstName}
                  onChange={handleUserInputChange}
                  placeholder="Enter first name"
                />
                {userErrors.firstName && <Text color="red" size="1">{userErrors.firstName}</Text>}
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
                  value={newUser.lastName}
                  onChange={handleUserInputChange}
                  placeholder="Enter last name"
                />
                {userErrors.lastName && <Text color="red" size="1">{userErrors.lastName}</Text>}
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
                value={newUser.email}
                onChange={handleUserInputChange}
                placeholder="Enter email address"
              />
              {userErrors.email && <Text color="red" size="1">{userErrors.email}</Text>}
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
                value={newUser.phoneNumber}
                onChange={handleUserInputChange}
                placeholder="Enter phone number"
              />
              {userErrors.phoneNumber && <Text color="red" size="1">{userErrors.phoneNumber}</Text>}
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
                value={newUser.postalAddress}
                onChange={handleUserInputChange}
                placeholder="Enter postal address"
              />
              {userErrors.postalAddress && <Text color="red" size="1">{userErrors.postalAddress}</Text>}
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
                value={newUser.city}
                onChange={handleUserInputChange}
                placeholder="Enter city"
              />
              {userErrors.city && <Text color="red" size="1">{userErrors.city}</Text>}
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
                value={newUser.birthDate}
                onChange={handleUserInputChange}
              />
              {userErrors.birthDate && <Text color="red" size="1">{userErrors.birthDate}</Text>}
            </Box>

            <Box>
              <label htmlFor="kind">
                <Text as="div" size="2" mb="1" weight="bold">
                  User Type
                </Text>
              </label>
              <Select.Root 
                defaultValue="renter"
                value={newUser.kind}
                onValueChange={handleUserKindChange}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="admin">Admin</Select.Item>
                    <Select.Item value="renter">Renter</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              {userErrors.kind && <Text color="red" size="1">{userErrors.kind}</Text>}
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={resetUserForm}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleUserSubmit}>
              Add User
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Product Dialog */}
      <Dialog.Root open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Edit Product</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update the product details.
          </Dialog.Description>
          
          <Flex direction="column" gap="3">
            <Box>
              <label htmlFor="edit-object">
                <Text as="div" size="2" mb="1" weight="bold">
                  Object Name
                </Text>
              </label>
              <TextField.Root 
                id="edit-object" 
                name="object"
                value={editProduct.object}
                onChange={handleEditInputChange}
                placeholder="Enter the object name"
              />
              {editErrors.object && <Text color="red" size="1">{editErrors.object}</Text>}
            </Box>
            
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="edit-brand">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Brand
                  </Text>
                </label>
                <TextField.Root 
                  id="edit-brand" 
                  name="brand"
                  value={editProduct.brand}
                  onChange={handleEditInputChange}
                  placeholder="Enter brand"
                />
                {editErrors.brand && <Text color="red" size="1">{editErrors.brand}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="edit-model">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Model
                  </Text>
                </label>
                <TextField.Root 
                  id="edit-model" 
                  name="model"
                  value={editProduct.model}
                  onChange={handleEditInputChange}
                  placeholder="Enter model"
                />
                {editErrors.model && <Text color="red" size="1">{editErrors.model}</Text>}
              </Box>
            </Flex>
            
            <Box>
              <label htmlFor="edit-quantity">
                <Text as="div" size="2" mb="1" weight="bold">
                  Quantity
                </Text>
              </label>
              <TextField.Root 
                id="edit-quantity" 
                name="quantity"
                type="number"
                value={editProduct.quantity}
                onChange={handleEditInputChange}
              />
              {editErrors.quantity && <Text color="red" size="1">{editErrors.quantity}</Text>}
            </Box>
            
            <Box>
              <label htmlFor="edit-description">
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
              </label>
              <TextField.Root 
                id="edit-description" 
                name="description"
                value={editProduct.description}
                onChange={handleEditInputChange}
                placeholder="Enter product description"
              />
              {editErrors.description && <Text color="red" size="1">{editErrors.description}</Text>}
            </Box>

            <Separator size="4" />
            
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <label htmlFor="edit-pricePerDay">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Daily Price
                  </Text>
                </label>
                <TextField.Root 
                  id="edit-pricePerDay" 
                  name="pricePerDay"
                  type="number"
                  value={editProduct.pricePerDay}
                  onChange={handleEditInputChange}
                />
                {editErrors.pricePerDay && <Text color="red" size="1">{editErrors.pricePerDay}</Text>}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <label htmlFor="edit-pricePerWeek">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Weekly Price
                  </Text>
                </label>
                <TextField.Root 
                  id="edit-pricePerWeek" 
                  name="pricePerWeek"
                  type="number"
                  value={editProduct.pricePerWeek}
                  onChange={handleEditInputChange}
                />
                {editErrors.pricePerWeek && <Text color="red" size="1">{editErrors.pricePerWeek}</Text>}
              </Box>
            </Flex>
            
            <Box>
              <label htmlFor="edit-cautionDeposit">
                <Text as="div" size="2" mb="1" weight="bold">
                  Security Deposit
                </Text>
              </label>
              <TextField.Root 
                id="edit-cautionDeposit" 
                name="cautionDeposit"
                type="number"
                value={editProduct.cautionDeposit}
                onChange={handleEditInputChange}
              />
              {editErrors.cautionDeposit && <Text color="red" size="1">{editErrors.cautionDeposit}</Text>}
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={resetEditForm}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Product Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Delete Product</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this product? This action cannot be undone.
          </Dialog.Description>
          
          {selectedProduct && (
            <Box mb="4" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '8px' }}>
              <Text weight="bold">{selectedProduct.object}</Text>
              <Text as="div" size="2" color="gray">
                {selectedProduct.brand} {selectedProduct.model}
              </Text>
            </Box>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" onClick={confirmDeleteProduct}>
              Delete Product
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default AdminPage;