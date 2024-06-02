import * as SecureStore from 'expo-secure-store';

// Helper functions to fetch data from the backend

export const fetchGetData = async (endpoint) => {
    const token = await SecureStore.getItemAsync('token'); // Retrieve token from secure store
    if (!token) {
        throw new Error('No token found');
    }
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export const fetchPostData = async (endpoint, body) => {
    const token = await SecureStore.getItemAsync('token'); // Retrieve token from secure store
    if (!token) {
        throw new Error('No token found');
    }
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}