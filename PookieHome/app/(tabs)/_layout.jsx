import {View, Text} from 'react-native';
import React from 'react';
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";

const TabsLayout = () => {
    return(
        <>
            <Stack>
                <Stack.Screen
                    name = "your-pookie"
                    options = {{
                        headerShown: false,
                    }}
                />
            </Stack>

            <StatusBar hidden={false} style={"dark"}/>
        </>
    )
}

export default TabsLayout;