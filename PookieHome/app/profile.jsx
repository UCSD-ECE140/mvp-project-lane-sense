import { StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/Custom Button';
import { router } from 'expo-router';
import { fetchGetData } from '../utils';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                let profileData = await fetchGetData('user/stats');
                console.log(profileData);
                setProfileData(profileData);
            } 
            catch (error) {
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
                <Text>{error}</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topButtonContainer}>
                <CustomButton
                    title="Go to Your Pookie!"
                    handlePress={() => router.push('/(tabs)/your-pookie')}
                    containerStyles="bg-black"
                />
            </View>
            <View style={styles.centerContainer}>
                <Text>Pookie Driver Stats:</Text>
                <Text>Harsh Turns: {profileData.harsh_turns}</Text>
                <Text>Harsh Brakes: {profileData.harsh_brakes}</Text>
                <Text>Harsh Accelerations: {profileData.harsh_accelerations}</Text>
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
