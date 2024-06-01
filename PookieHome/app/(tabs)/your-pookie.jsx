import {View, Text, ScrollView, Image, StyleSheet} from 'react-native';
import React from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import LevelBar from "../../components/levelbar";
import Trip from "../../components/Trip";
import CustomButton from "../../components/Custom Button";
import {router} from "expo-router";

const YourPookie = (route) => {
    const { level, pookieName, xp, trips } = route.params;

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