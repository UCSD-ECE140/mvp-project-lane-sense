import {ScrollView, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import {APIProvider, Map, useMapsLibrary, useMap} from "@vis.gl/react-google-maps";
import StarRating from "../../../components/starRating";
import {SafeAreaView} from "react-native-safe-area-context";
import MapView, { Marker,PROVIDER_GOOGLE } from 'react-native-maps';

const Location = () => {
    const { location } = useGlobalSearchParams();
    const [mapRegion, setMapRegion] = useState(null);
    const position = {lat: 43.6352, lng: -79.3832};
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
                        size={"75"}
                    />
                    <Text className={"font-pbold text-3xl"}>Trip info</Text>
                    <View>
                        <MapView className={"w-full h-full"}/>
                    </View>
                    <Text className={"ml-2 font-pbold text-2xl"}>Trip Summary:</Text>
                    <Text className={"ml-2 mt-2 text-xl italic"}>Pookie travelled 20 miles to
                        visit Coronado Island.

                        {"\n"}
                        {"\n"}Pookie ABHORRED this bumpy ride and couldn’t enjoy any of the scenery.

                        {"\n"}
                        {"\n"}Drive better, for Pookie’s sake.</Text>

                </View>
            </ScrollView>
        </SafeAreaView>
    )


}

export default Location;