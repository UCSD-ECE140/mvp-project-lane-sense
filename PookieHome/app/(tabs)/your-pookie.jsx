import { View, Text, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import LevelBar from "../../components/levelbar";
import Trip from "../../components/Trip";
import CustomButton from "../../components/Custom Button";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fetchGetData } from '../../utils';
import { useBluetooth } from '../../BluetoothContext';

const YourPookie = (/* route */) => {
    // const { level, pookieName, xp, trips } = route.params;
    const {
        connectedDevice,
    } = useBluetooth();

    const [level, setLevel] = useState(0);
    const [pookieName, setPookieName] = useState("");
    const [xp, setXp] = useState(0);
    const [trips, setTrips] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPookieData = async () => {
            try {
                return await fetchGetData('pookie/details');
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
        const fetchRecentTrips = async () => {
            try {
                return await fetchGetData('user/recent_trips');
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

    return (
        <ScrollView className={"bg-pastel-blue"}>
            <SafeAreaView>
                <View className="flex-col">
                    <Text className={"font-pblack ml-auto mr-auto text-5xl mb-6 text-fuchsia-50"}>{pookieName}</Text>
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
                        title="Start a new trip!"
                        handlePress={() => { router.push("/start-trip") }}
                        containerStyles="mt-5 w-full bg-green-400"
                        textStyles={"underline font-pbold text-white text-4xl pb-10 pt-5"}
                    />
                </View>

                <View>
                    <Text style={styles.text} className={"ml-2 mt-4 mb-4 text-3xl font-pbold text-white"}>Recent Trips:</Text>
                    <View>
                        {trips.map(trip => (
                            <Trip
                                key={trip.trip_id}
                                trip_id={trip.trip_id}
                                location={trip.location}
                                distance={trip.distance}
                                biscuits={trip.biscuits}
                                stars={trip.stars}
                            />
                        ))}
                    </View>
                </View>

                <View className={"w-full flex-row"}>
                    <CustomButton
                        title="Friends"
                        handlePress={() => { router.push("/friends") }}
                        containerStyles="mt-5 w-full bg-amber-200"
                        textStyles={"underline font-pbold text-white text-4xl pb-10 pt-5"}
                    />
                </View>
            </SafeAreaView>
        </ScrollView>

    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
    },
    connectButtonContainer: {
        backgroundColor: '#6200ea', // Deep purple
        borderRadius: 25,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    connectButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    text: {
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 4,
    }
});

export default YourPookie;