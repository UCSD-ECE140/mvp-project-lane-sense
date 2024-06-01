import React from 'react';
import { View, StyleSheet } from 'react-native';
import Star from './Stars';

const StarRating = ({ num, size = 24, otherStyles }) => {
    return (
        <View className={`flex-row ml-2 mb-5 ${otherStyles}`}>
            {[...Array(5)].map((_, index) => (
                <Star key={index} size={size} color={index < num ? 'gold' : 'white'} />
            ))}
        </View>
    );
};


export default StarRating;