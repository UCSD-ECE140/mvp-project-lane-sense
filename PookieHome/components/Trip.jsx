import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Star from "./Stars";
import StarRating from "./starRating";
import {Link} from 'expo-router';

const Trip = ({
    location, distance,
    biscuits,
    stars})=>{
    return (
        <Link href={`../(tabs)/tripinfo/${location}`} asChild>
            <TouchableOpacity className = {"ml-10 mr-2.5 border-2 border-white border-b-0 p-2 bg-pastel-orange"}
                              activeOpacity={0.6}>
                <Text className={"text-lg font-pbold text-white"}>Trip to {location} - {distance} mi</Text>
                <View className={"flex-row justify-between mt-2 mb-2 mr-5"}>
                    <StarRating
                        num = {stars}
                    />
                    <Text className={"italic text-gray"}>+{biscuits} biscuits</Text>
                </View>
            </TouchableOpacity>
        </Link>

    )
}


export default Trip;
