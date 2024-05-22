import React, {useState} from 'react'
import {StyleSheet, Text, View} from "react-native";
import {Polygon, Svg} from 'react-native-svg';

const Star = ({size = 24, color = 'gold'}) => {
    const points = [
        {x: 50, y: 0},
        {x: 61, y: 35},
        {x: 98, y: 35},
        {x: 68, y: 57},
        {x: 79, y: 91},
        {x: 50, y: 70},
        {x: 21, y: 91},
        {x: 32, y: 57},
        {x: 2, y: 35},
        {x: 39, y: 35},
    ];

    const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <View>
            <Svg height={size} width={size} viewBox="0 0 100 100">
                <Polygon points={pointsString} fill={color}/>
            </Svg>
        </View>
    )
}


export default Star;
