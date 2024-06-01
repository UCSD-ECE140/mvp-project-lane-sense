import {View, Text, ScrollView, Animated} from 'react-native';
import React from 'react';
import LevelBar from "../../components/levelbar";
import CustomButton from "../../components/Custom Button";
import {router} from "expo-router";
import Friend from "../../components/Friend";
import {SafeAreaView} from "react-native-safe-area-context";
import Trip from "../../components/Trip";

const Friends = () => {
    // get friends from BACKEND, based on the bluetooth connectivity and
    const friends = [{src: 'koala', name: "Pika", lvl: "5", progress: 50},
        {src: 'elephant', name: "Lorenzo", lvl: "4", progress: 60},
        {src: 'gf', name: "Denny", lvl: "10", progress: 20}
    ];

    return (
        <ScrollView className={"bg-pastel-orange"}>
            <View className={'w-screen'}>
                {friends.map((friend) => (
                    <Friend
                        imgSource={friend.src}
                        name={friend.name}
                        level= {`${friend.lvl}`}
                        bgColor={`bg-${friend.src}-base`}
                        progress={friend.progress}
                    />
                ))}
                <CustomButton
                    title="Make more friends!"
                    handlePress={() => {
                        ///ADD FRIEND TO DATABASE
                    }}
                    containerStyles="mr-auto mt-5 ml-auto bg-white w-full h-full mb-6"
                    textStyles={"text-4xl pb-10 pt-5 text-gray-400 font-pextrabold underline"}
                />

            </View>
        </ScrollView>
    );
}

export default Friends;