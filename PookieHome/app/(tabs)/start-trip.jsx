import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useBluetooth } from '../../BluetoothContext';
import { fetchPostData } from '../../utils';
import CustomButton from '../../components/Custom Button';

var locationUpdateURL = '';

const StartTrip = () => {
    const {
        connectedDevice,
        disconnectFromDevice,
    } = useBluetooth();
    
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [connectButtonText, setConnectButtonText] = useState("Connect to Pookie to Start Your Trip!");
    const [routeCoordinates, setRouteCoordinates] = useState([]); // Array to store the route coordinates
    
    const intervalId = useRef(null); // useRef to store the interval ID

    useEffect(() => {
        return () => {
            // Clear interval when the component unmounts
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        };
    }, []);

    useEffect(() => {
        const getLocationAndUpdate = async () => {
            try {
                // Get current location
                let location = await Location.getCurrentPositionAsync({});
                setRouteCoordinates(prevRoute => [
                    ...prevRoute,
                    {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }
                ]);
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
            setRouteCoordinates([{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }]);
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
            intervalId.current = setInterval(getLocationAndUpdate, 10 * 1000); // Update every 10 seconds
        };

        if (!connectedDevice) {
            setConnectButtonText("Connect to Pookie to Start Your Trip!");
        } else {
            setConnectButtonText("Connected to Pookie! Trip Started!");
            initTrip();
        }

        // Cleanup interval when connectedDevice changes
        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        };
    }, [connectedDevice]);

    useEffect(() => {
        if (tripId) {
            locationUpdateURL = `trip/${tripId}/location_update`;
        }
    }, [tripId]);

    const handleBTButton = () => {
        router.navigate('/connecting');
    };

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
                <CustomButton
                    title={connectButtonText}
                    handlePress={handleBTButton}
                    containerStyles="bg-blue-300 rounded-lg"
                    textStyles={"underline font-pbold text-white text-1xl"}
                    isLoading={connectedDevice !== null}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Your trip has started!</Text>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
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
                <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={5}
                    strokeColor="blue"
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
        height: '95%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default StartTrip;
