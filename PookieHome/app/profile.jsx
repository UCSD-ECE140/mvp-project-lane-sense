import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await SecureStore.getItemAsync('token'); // Retrieve token from secure store
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/stats`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                setError(`Error fetching profile data: ${error.message}`);
            }
        };

        fetchProfileData();
    }, []);

    if (error) {
        return (
            <View style={styles.container}>
                <Text>Error: {error}</Text>
                <StatusBar style="auto" />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
                <StatusBar style="auto" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>Pookie Driver Stats:</Text>
            <Text>Harsh Turns: {profileData.harsh_turns}</Text>
            <Text>Harsh Brakes: {profileData.harsh_brakes}</Text>
            <Text>Fast Accelerations: {profileData.fast_accelerations}</Text>
            <Text>Driver Rating: {profileData.driver_rating}</Text>
            <StatusBar style="auto" />
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
