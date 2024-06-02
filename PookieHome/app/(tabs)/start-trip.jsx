import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useBluetooth } from '../../BluetoothContext';
import { fetchPostData } from '../../utils';

var locationUpdateURL = '';

const StartTrip = () => {
    const {
        connectedDevice,
        disconnectFromDevice,
    } = useBluetooth();
    
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tripId, setTripId] = useState(null);

    useEffect(() => {
        let intervalId;
        const getLocationAndUpdate = async () => {
            try {
                // Get current location
                let location = await Location.getCurrentPositionAsync({});
                // Make a post request to the server to update the trip location
                let body = {
                    coordinates: [location.coords.latitude, location.coords.longitude],
                };
                await fetchPostData(locationUpdateURL, body);
            } catch (error) {
                setErrorMsg(`Error updating trip location: ${error.message}`);
            }
        };
        const initTrip = async () => {
            // Check if bluetooth device is connected
            /* if (!connectedDevice) {
                setErrorMsg('No Pookie device connected');
                return;
            } */
            // Check for location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            // Get current location
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            // Make a post request to the server to start the trip
            try {
                let body = {
                    start_location: [location.coords.latitude, location.coords.longitude],
                };
                let response = await fetchPostData('trip/create', body);
                console.log(response);
                setTripId(response.trip_id);
            } catch (error) {
                setErrorMsg(`Error starting trip: ${error.message}`);
            }
            // Set interval to periodically fetch and update location
            intervalId = setInterval(getLocationAndUpdate, 10 * 1000); // Update every 10 seconds
        };
        initTrip();
        return () => {
            // Clear interval when the component unmounts
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    useEffect(() => {
        if (tripId) {
            locationUpdateURL = `trip/${tripId}/location_update`;
        }
    }, [tripId]);

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text>{errorMsg}</Text>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}
                    title="Trip Start"
                />
            </MapView>
            <View style={styles.buttonContainer}>
                <Button title="Stop Trip" onPress={() => router.back()} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
});

export default StartTrip;