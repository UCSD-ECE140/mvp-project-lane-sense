// web: 14032582387-cojit7ok7o701gcmmrldug8g3vfgs2rf.apps.googleusercontent.com
// android: 14032582387-vmgo5p77jrsd9436572uci4fko9r6dms.apps.googleusercontent.com
// ios: 14032582387-h60a2gr3raqs9c4fqoqdvmrtq8g40elt.apps.googleusercontent.com
import {View, Button, Text, Image, StyleSheet, Platform} from 'react-native';

import * as React from 'react';
import {HelloWave} from '@/components/HelloWave';
import {StatusBar} from "expo-status-bar";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {white} from "colorette";

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
    const [userInfo, setUserInfo] = React.useState(null);
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "14032582387-vmgo5p77jrsd9436572uci4fko9r6dms.apps.googleusercontent.com",
        iosClientId: "14032582387-h60a2gr3raqs9c4fqoqdvmrtq8g40elt.apps.googleusercontent.com",
        webClientId: "14032582387-cojit7ok7o701gcmmrldug8g3vfgs2rf.apps.googleusercontent.com",
    });

    React.useEffect(() => {
        handleSignInWithGoogle();
    }, [response])

    async function handleSignInWithGoogle() {
        const user = await AsyncStorage.getItem("@user");
        if (!user) {
            if(response?.type === "success") {
                // @ts-ignore
                await getUserInfo(response.authentication.accessToken);
            }
        } else {
            setUserInfo(JSON.parse(user));
        }
    }

    const getUserInfo = async (token: string) => {
        if (!token) return;
        try {
            const response = await fetch(
                "https://www.googleapis.com/userinfo/v2/me",
                {
                    headers: {Authorization: `Bearer ${token}`},
                });
            const user = await response.json();
            await AsyncStorage.setItem("@user", JSON.stringify(user));
            setUserInfo(user);
        } catch (error) {
            alert(error);
        }

    }
    return (
        <View style={styles.titleContainer}>
            <Text>{JSON.stringify(userInfo, null, 2)}</Text>
            <Text style={styles.text}>Code with Yung Sudy</Text>
            <Button title="Sign in with Google"
                    onPress={() => {
                        promptAsync();
                    }}/>
            <Button title="delete local storage" onPress = {() => AsyncStorage.removeItem("@user")}></Button>
            <StatusBar style="auto"/>
        </View>
    );

}

const styles = StyleSheet.create({
    titleContainer: {
            alignItems: 'center',
        gap: 8,
    },

    text: {
        fontSize: 60,
        textAlign: 'center',
        color: 'white'
    },
});
