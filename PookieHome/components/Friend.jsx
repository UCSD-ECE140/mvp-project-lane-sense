import {Text, Image, View} from "react-native";
import React from "react";
import LevelBar from "./levelbar";
import CustomButton from "./Custom Button";
import {router} from "expo-router";


const images = {
    koala: require('../assets/images/koala.png'),
    elephant: require('../assets/images/elephant.png'),
    gf: require('../assets/images/gf.png'),
};

const Friend = ({imgSource, name, level, bgColor, progress}) => {
    return (
        <View className={`flex-row`}>
            <View className={''}>
                <Image
                    source={images[imgSource]}
                    className={'w-48 h-48'}
                />
            </View>

            <View className={`flex-col flex-1 ${bgColor} justify-center`}>
                <View className={'flex-row justify-between ml-4 mr-4 mt-7'}>
                    <Text className={'text-2xl font-pextrabold text-white'}>{name}</Text>
                    <Text className={'font-light italic text-white'}>{level}</Text>
                </View>
                <View>
                    <LevelBar
                        progress={progress}
                        height={10}
                        otherStyles={"mb-5 ml-5 bg-fuchsia-200"}
                        childStyles={"bg-gray-500"}
                    />
                </View>
                <CustomButton
                    title="View Info"
                    handlePress={() => {
                        router.push(`your-pookie`)
                    }}
                    containerStyles= "mr-auto mt-auto ml-auto bg-custom-yellow mb-12"
                />
            </View>

        </View>

    )
}

export default Friend;