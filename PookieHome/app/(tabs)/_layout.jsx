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
                    initialParams={{
                        level: 5,
                        pookieName: 'Pookie',
                        xp: 50,
                        trips: [{location: "Coronado Island", distance: "5 mi", biscuits: "5", stars: "3"}],
                    }}
                />
            </Stack>

            <StatusBar hidden={false} style={"dark"}/>
        </>
    )
}

export default TabsLayout;