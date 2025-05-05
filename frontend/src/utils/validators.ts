import { isEmail as validateEmail, isEmpty as validateEmpty } from 'validator';

interface UserErrors {
    firstName?: string;
    lastName?: string;
    postalAddress?: string;
    city?: string;
    birthDate?: string;
    phoneNumber?: string;
    email?: string;
}

interface UserData {
    firstName: string;
    lastName: string;
    postalAddress: string;
    city: string;
    birthDate: string;
    phoneNumber: string;
    email: string;
}

interface ProductErrors {
    object?: string;
    brand?: string;
    model?: string;
    quantity?: string;
    description?: string;
    pricePerDay?: string;
    pricePerWeek?: string;
    cautionDeposit?: string;
}

interface ProductData {
    object: string;
    brand: string;
    model: string;
    quantity: number;
    description: string;
    pricePerDay: number;
    pricePerWeek: number;
    cautionDeposit: number;
}

export const validateUserInput = (data: UserData): { errors: UserErrors; isValid: boolean } => {
    const errors: UserErrors = {};

    if (validateEmpty(data.firstName)) {
        errors.firstName = 'First name is required';
    }

    if (validateEmpty(data.lastName)) {
        errors.lastName = 'Last name is required';
    }

    if (validateEmpty(data.postalAddress)) {
        errors.postalAddress = 'Postal address is required';
    }

    if (validateEmpty(data.city)) {
        errors.city = 'City is required';
    }

    if (validateEmpty(data.birthDate)) {
        errors.birthDate = 'Birth date is required';
    }

    if (validateEmpty(data.phoneNumber)) {
        errors.phoneNumber = 'Phone number is required';
    }

    if (!validateEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

export const validateProductInput = (data: ProductData): { errors: ProductErrors; isValid: boolean } => {
    const errors: ProductErrors = {};

    if (validateEmpty(data.object)) {
        errors.object = 'Object is required';
    }

    if (validateEmpty(data.brand)) {
        errors.brand = 'Brand is required';
    }

    if (validateEmpty(data.model)) {
        errors.model = 'Model is required';
    }

    if (data.quantity <= 0) {
        errors.quantity = 'Quantity must be greater than zero';
    }

    if (validateEmpty(data.description)) {
        errors.description = 'Description is required';
    }

    if (data.pricePerDay <= 0) {
        errors.pricePerDay = 'Price for 1-day rent must be greater than zero';
    }

    if (data.pricePerWeek <= 0) {
        errors.pricePerWeek = 'Price for 1-week rent must be greater than zero';
    }

    if (data.cautionDeposit < 0) {
        errors.cautionDeposit = 'Caution/deposit cannot be negative';
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};