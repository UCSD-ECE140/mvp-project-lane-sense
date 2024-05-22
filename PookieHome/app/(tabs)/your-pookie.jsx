import {View, Text, ScrollView, Image, StyleSheet} from 'react-native';
import React from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import LevelBar from "../../components/levelbar";
import Trip from "../../components/Trip";

const YourPookie = () => {
    return(
        <SafeAreaView className={"bg-pastel-blue"}>
            <ScrollView>
                <View className = "flex-col justify-center">
                    <Text className={"font-pblack ml-auto mr-auto mt-10 text-3xl mb-6 text-fuchsia-50"}>pookie</Text>
                    <View className={"flex-row justify-start ml-auto mr-auto"}>
                        <Text className={"italic font-pmedium pr-2 text-fuchsia-50"}>Lvl. 1</Text>
                        <LevelBar
                            progress="50"
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
                    <View className={""}>
                            <Trip
                                location="Coronado Island"
                                distance="20"
                                biscuits="5"
                                stars = "2"
                            />
                            <Trip
                            location="Walgreens"
                            distance="10"
                            biscuits="3"
                            stars = "4"
                        />
                        <Trip
                            location="Starbucks"
                            distance="5"
                            biscuits="3"
                            stars = "4"
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>

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