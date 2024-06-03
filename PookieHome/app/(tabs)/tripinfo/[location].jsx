import { ScrollView, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import StarRating from '../../../components/starRating';
import { fetchGetData } from '../../../utils';

const Location = () => {
    const { trip_id } = useGlobalSearchParams();
    const [tripSummary, setTripSummary] = useState("");
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [locationUpdates, setLocationUpdates] = useState([]);
    const [starRating, setStarRating] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                let tripData = await fetchGetData(`trip/${trip_id}/details`);
                setTripSummary(tripData.trip_summary);
                setStartLocation(tripData.start_location);
                setEndLocation(tripData.end_location);
                setLocationUpdates(tripData.location_updates);
                setStarRating(tripData.stars);
            } catch (error) {
                setError(`Error fetching trip data: ${error.message}`);
            }
        };
        fetchTripData();
    }, [trip_id]);

    if (error) {
        return (
            <SafeAreaView>
                <Text>{error}</Text>
            </SafeAreaView>
        );
    }

    // Convert locationUpdates to coordinates suitable for Polyline
    const polylineCoordinates = locationUpdates.map(point => ({
        latitude: point[0],
        longitude: point[1]
    }));

    return (
        <SafeAreaView className="bg-pastel-blue h-full">
            <ScrollView>
                <View>
                    <StarRating
                        num={starRating}
                        size={68}
                        otherStyles="ml-auto mr-auto mt-12 mb-16"
                    />
                    <Text className="ml-3 font-extrabold text-5xl text-red-800 text-center mb-2">TRIP INFO</Text>
                    <View className="mb-5 justify-center">
                        {startLocation && endLocation && (
                            <MapView
                                userInterfaceStyle="light"
                                className="mt-5 w-80 ml-auto mr-auto h-80"
                                initialRegion={{
                                    latitude: startLocation[0],
                                    longitude: startLocation[1],
                                    latitudeDelta: 0.1,
                                    longitudeDelta: 0.1,
                                }}>
                                <Marker
                                    coordinate={{ latitude: startLocation[0], longitude: startLocation[1] }}
                                    title="Start"
                                />
                                <Marker
                                    coordinate={{ latitude: endLocation[0], longitude: endLocation[1] }}
                                    title="End"
                                />
                                <Polyline
                                    coordinates={polylineCoordinates}
                                    strokeColor="#FF0000"
                                    strokeWidth={2}
                                />
                            </MapView>
                        )}
                    </View>
                </View>
                <View>
                    <Text className="ml-4 pl-2 pt-1 pb-1 font-pbold text-3xl mt-5 mb-5 bg-pastel-orange text-pink-100">Trip Summary:</Text>
                    <Text className="pl-2 mr-10 pr-4 pb-5 pt-5 mt-2 text-xl mb-20 bg-pastel-blue text-blue-800">{tripSummary}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Location;
