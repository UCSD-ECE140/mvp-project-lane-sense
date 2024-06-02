import {View, Text, ScrollView, Image, StyleSheet} from 'react-native';
import React, { useEffect, useState } from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import LevelBar from "../../components/levelbar";
import Trip from "../../components/Trip";
import CustomButton from "../../components/Custom Button";
import {router} from "expo-router";
import * as SecureStore from "expo-secure-store";

const YourPookie = (/* route */) => {
    // const { level, pookieName, xp, trips } = route.params;

    const [level, setLevel] = useState(0);
    const [pookieName, setPookieName] = useState("");
    const [xp, setXp] = useState(0);
    const [trips, setTrips] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPookieData = async () => {
            try {
                const token = await SecureStore.getItemAsync('token'); // Retrieve token from secure store
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/pookie/details`, {
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
            } catch (error) {
                if (error.message?.includes('401')) {
                    setError('Please log in to view this page');
                }
                else {
                    setError(`Error fetching profile data: ${error.message}`);
                }
            }
        };
        const fetchRecentTrips = async () => {
            try {
                const token = await SecureStore.getItemAsync('token'); // Retrieve token from secure store
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/recent_trips`, {
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
            } catch (error) {
                if (error.message?.includes('401')) {
                    setError('Please log in to view this page');
                }
                else {
                    setError(`Error fetching profile data: ${error.message}`);
                }
            }
        };
        const setPookieData = async () => {
            console.log("Fetching pookie data");
            let pookieData = await fetchPookieData();
            console.log(pookieData);
            setLevel(pookieData.level);
            setPookieName(pookieData.pookie_name);
            setXp(pookieData.xp);
            let recentTripData = await fetchRecentTrips();
            setTrips(recentTripData);
        }
        setPookieData();
    }, []);

    return(
            <ScrollView className={"bg-pastel-blue"}>
                <View className = "flex-col">
                    <Text className={"font-pblack ml-auto mr-auto mt-10 text-5xl mb-6 text-fuchsia-50"}>{pookieName}</Text>
                    <View className={"flex-row justify-start ml-auto mr-auto"}>
                        <Text className={"italic font-pmedium pr-2 text-fuchsia-50"}>Lvl. {level}</Text>
                        <LevelBar
                            progress={xp}
                            height={15}
                            otherStyles={"mb-5"}
                        />
                    </View>
                </View>

                <View className={"h-50"}>
                    <Image
                        source={require('../../assets/images/pookie.png')}
                    />
                </View>

                <View className={"w-full flex-row"}>
                    <CustomButton
                        title = "Start a new trip!"
                        handlePress={()=>{router.push("/start-trip")}}
                        containerStyles= "mt-5 w-full bg-green-400"
                        textStyles={"underline font-pbold text-white text-4xl pb-10 pt-5"}
                    />
                </View>

                <View>
                    <Text style={styles.text} className={"ml-2 mt-4 mb-4 text-3xl font-pbold text-white"}>Recent Trips:</Text>
                    <View>
                        {trips.map(trip => (
                            <Trip
                                location={trip.location}
                                distance={trip.distance}
                                biscuits={trip.biscuits}
                                stars ={trip.stars}
                            />
                        ))}
                    </View>
                </View>

                <View className={"w-full flex-row"}>
                    <CustomButton
                        title = "Friends"
                        handlePress={()=>{router.push("/friends")}}
                        containerStyles= "mt-5 w-full bg-amber-200"
                        textStyles={"underline font-pbold text-white text-4xl pb-10 pt-5"}
                    />
                </View>
            </ScrollView>

    )
}

const styles = StyleSheet.create({
    text: {
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 3},
        textShadowRadius: 4,
    }
});

export default YourPookie;