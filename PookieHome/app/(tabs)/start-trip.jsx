import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useBluetooth } from '../../BluetoothContext';
import { fetchPostData, fetchPutData } from '../../utils';
import CustomButton from '../../components/Custom Button';

const StartTrip = () => {
    const { 
        connectedDevice,
        data, 
        disconnectFromDevice 
    } = useBluetooth();
    
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [connectButtonText, setConnectButtonText] = useState("Connect to Pookie to Start Your Trip!");
    const [routeCoordinates, setRouteCoordinates] = useState([]); // Array to store the route coordinates
    // Data from Pookie
    const [harshTurns, setHarshTurns] = useState(0);
    const [harshAccelerations, setHarshAccelerations] = useState(0);
    const [harshBrakes, setHarshBrakes] = useState(0);
    
    const intervalId = useRef(null); // useRef to store the interval ID

    /* // testing updating harsh turns, accelerations, and brakes
    const testIntervalId = useRef(null); // useRef to store the test interval ID
    const [data, setData] = useState({
        harsh_turns: 0,
        harsh_accelerations: 0,
        harsh_brakes: 0,
    }); // Data from Pookie */

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
            // Check for location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            // Get initial location
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
                setTripId(response.trip_id);
            } catch (error) {
                setErrorMsg(`Error starting trip: ${error.message}`);
            }
            // Set interval to periodically fetch and update location
            intervalId.current = setInterval(getLocationAndUpdate, 10 * 1000); // Update every 10 seconds
            // testing updating harsh turns, accelerations, and brakes
            /* testIntervalId.current = setInterval(() => {
                console.log("Updating harsh turns, accelerations, and brakes");
                setData(prevData => ({
                    ...prevData, // Spread the previous state
                    harsh_turns: prevData.harsh_turns + 1,
                    harsh_accelerations: prevData.harsh_accelerations + 1,
                    harsh_brakes: prevData.harsh_brakes + 1,
                }));
            }, 20 * 1000); */
        };

        if (connectedDevice) {
            setConnectButtonText("Connected to Pookie! Trip Started!");
            initTrip();
        } else {
            setConnectButtonText("Connect to Pookie to Start Your Trip!");
        }
    }, [connectedDevice]);

    useEffect(() => {
        if (tripId) {
            locationUpdateURL = `trip/${tripId}/location_update`;
        }
    }, [tripId]);

    useEffect(() => {
        if (data) {
            console.log("Received data from Pookie:", data);
            console.log("Type of data:", typeof data);
            let parsedData = data.split(' ');
            let harshTurns = parseInt(parsedData[0]);
            let harshAccelerations = parseInt(parsedData[1]);
            let harshBrakes = parseInt(parsedData[2]);
            setHarshTurns(harshTurns);
            setHarshAccelerations(harshAccelerations);
            setHarshBrakes(harshBrakes);
        }
    }, [data]);

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
                <Button title="Stop Trip" onPress={() => {
                    clearInterval(intervalId.current);
                    /* clearInterval(testIntervalId.current); */
                    // Disconnect from Bluetooth device
                    disconnectFromDevice();
                    // Make a post request to the server to end the trip
                    const endTrip = async () => {
                        if (location) {
                            try {
                                let current_location = await Location.getCurrentPositionAsync({});
                                let body = {
                                    end_location: [current_location.coords.latitude, current_location.coords.longitude],
                                    harsh_turns_made: harshTurns,
                                    harsh_accelerations_made: harshAccelerations,
                                    harsh_brakes_made: harshBrakes,
                                };
                                await fetchPutData(`trip/${tripId}/complete`, body);
                            } catch (error) {
                                console.log(error);
                                setErrorMsg(`Error ending trip: ${error.message}`);
                            }
                        }
                    };
                    endTrip();
                    router.back();
                }} />
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
