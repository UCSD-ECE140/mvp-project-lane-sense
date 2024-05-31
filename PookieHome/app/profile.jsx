import { StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import CustomButton from '../components/Custom Button';
import { router } from 'expo-router';

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
                if (error.message?.includes('401')) {
                    setError('Please log in to view this page');
                }
                else {
                    setError(`Error fetching profile data: ${error.message}`);
                }
            }
        };
        fetchProfileData();
    }, []);

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text>Error: {error}</Text>
                <StatusBar style="auto" />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading...</Text>
                <StatusBar style="auto" />
            </View>
        );
    }

    const handleBTButton = async () => {
        router.navigate('/connecting');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topButtonContainer}>
                <CustomButton
                    title="Connect to Bluetooth Device"
                    handlePress={handleBTButton}
                    containerStyles="bg-black"
                />
            </View>
            <View style={styles.centerContainer}>
                <Text>Pookie Driver Stats:</Text>
                <Text>Harsh Turns: {profileData.harsh_turns}</Text>
                <Text>Harsh Brakes: {profileData.harsh_brakes}</Text>
                <Text>Fast Accelerations: {profileData.fast_accelerations}</Text>
                <Text>Driver Rating: {profileData.driver_rating}</Text>
                <StatusBar style="auto" />
            </View>
        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    topButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
});
