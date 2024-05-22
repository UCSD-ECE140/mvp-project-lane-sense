import React from 'react';
import { View, StyleSheet } from 'react-native';
import Star from './Stars';

const StarRating = ({ num, size = 24 }) => {
    return (
        <View className={"flex-row ml-2 mb-5"}>
            {[...Array(5)].map((_, index) => (
                <Star key={index} size={size} color={index < num ? 'gold' : 'grey'} />
            ))}
        </View>
    );
};


export default StarRating;