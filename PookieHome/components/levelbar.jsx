import React from 'react'
import {StyleSheet, Text, View} from "react-native";

const LevelBar = ({progress,height,otherStyles, childStyles}) => {
    const styles = StyleSheet.create({
        Parentdiv: {
            height: height,
            width: '70%',
            borderRadius: 40,
        },
        Childdiv: {
            height: height,
            width: `${progress}%`,
            borderRadius: 40,
            textAlign: 'right'
        },
        progresstext: {
            color: 'black',
        }
    });

    return (
        <View style={styles.Parentdiv} className = {`bg-pastel-orange ${otherStyles}`}>
            <View style={styles.Childdiv} className = {`bg-blue-500 ${childStyles}`}>
            </View>
        </View>
    )
}



export default LevelBar;
