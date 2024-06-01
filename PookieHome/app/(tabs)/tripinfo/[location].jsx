import {ScrollView, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import {APIProvider, Map, useMapsLibrary, useMap} from "@vis.gl/react-google-maps";
import StarRating from "../../../components/starRating";
import {SafeAreaView} from "react-native-safe-area-context";
import MapView, { Marker,PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions";

const Location = () => {
    const {location} = useGlobalSearchParams();
    const position = {lat: 43.6352, lng: -79.3832};

    //Random Values for now, but will be fetched from BACKEND, based on the {location} parameter

    const startLat = 48.8587741;
    const startLong = 2.2069771;
    const endLat = 48.8323785;
    const endLong = 2.3361663;
    const tripSummary = "Pookie travelled 20 miles to visit Coronado Island. Pookie ABHORRED this bumpy ride and couldn’t enjoy any of the scenery. Drive better, for Pookie’s sake!!!";


    const response = {startLat, startLong, endLat, endLong, tripSummary}

    const [coordinates] = useState([
        {
            latitude: response.startLat,
            longitude: response.startLong,
        },
        {
            latitude: response.endLat,
            longitude: response.endLong,
        },
    ]);
    //
    // useEffect(() => {
    //     if (location) {
    //         fetchTripData(location);
    //     }
    // }, [location]);
    //
    // const fetchTripData = async (location) => {
    //     try {
    //         const response = await fetch(`https://api.example.com/tripinfo/${location}`);
    //         const data = await response.json();
    //         setTripData(data);
    //     } catch (error) {
    //         console.error("Error fetching trip data:", error);
    //     }
    // };

    return (
        <SafeAreaView className={"bg-pastel-blue h-full"}>
            <ScrollView>
                <View>
                    <StarRating
                        num = "2"
                        size={68}
                        otherStyles={"ml-auto mr-auto mt-12 mb-16"}
                    />
                    <Text className={"ml-3 font-extrabold text-5xl text-red-800 text-center mb-2"}>TRIP INFO</Text>
                    <View className={"mb-5 justify-center"}>
                        <MapView
                            userInterfaceStyle={"light"}
                            className={"mt-5 w-80 ml-auto mr-auto h-80"}
                            initialRegion={{
                                latitude: startLat,
                                longitude: startLong,
                                latitudeDelta: 0.0622,
                                longitudeDelta: 0.0121,
                            }}>
                            <MapViewDirections
                                origin={coordinates[0]}
                                destination={coordinates[1]}
                                apikey={"AIzaSyBqErxBAj2SgY8DqzXHLpDPEsAReH8LB64"}
                                strokeWidth={2}
                                strokeColor="#111111"
                            />
                            <Marker coordinate={coordinates[0]} />
                            <Marker coordinate={coordinates[1]} />
                        </MapView>
                    </View>
                </View>
                <View>
                    <Text className={"ml-4 pl-2 pt-1 pb-1 font-pbold text-3xl mt-5 mb-5 bg-pastel-orange text-pink-100"}>Trip Summary:</Text>
                    <Text className={"pl-2 mr-10 pr-4 pb-5 pt-5 mt-2 text-xl mb-20 bg-pastel-blue text-blue-800"}>{tripSummary}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )

}

export default Location;