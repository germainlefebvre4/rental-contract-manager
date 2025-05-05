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
  Avatar
} from '@radix-ui/themes';
import { getProducts, createProduct } from '../../services/api';
import { validateProductInput } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';
import { Product } from '../../types';

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchProducts();
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
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={6}>
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
              <Text>User management will be implemented here.</Text>
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
    </Box>
  );
};

export default AdminPage;