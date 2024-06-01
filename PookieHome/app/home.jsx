import {StatusBar} from 'expo-status-bar';
import {StyleSheet, ImageBackground, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Redirect, router} from 'expo-router';
import SignIn from "./(auth)/sign-in";
import CustomButton from "../components/Custom Button";

const image = require("../assets/images/pookieHome.png")

export default function App() {
    return (
        <View className="flex-1 items-center justify-center">
            <ImageBackground source={image} className="relative w-screen h-screen">
                <SafeAreaView className="flex-1 static justify-center">
                    <Text style={styles.text} className="absolute font-pbold text-custom-yellow top-16 left-0 right-0 text-center">Join the PookieVerse</Text>
                    <CustomButton
                        title = "Sign In"
                        handlePress={()=>{router.push("/sign-in")}}
                        containerStyles= "absolute mt-7 bottom-16 bg-custom-yellow"
                    />
                    <StatusBar hidden={true}/>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 40,
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 3},
        textShadowRadius: 4,
    },
    text2: {
        textShadowColor: 'white',
        textShadowOffset: { width: 0, height: -3},
        textShadowRadius: 4,
    },
});



