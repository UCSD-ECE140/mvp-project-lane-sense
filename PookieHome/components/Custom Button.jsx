import {TouchableOpacity, Text, View} from 'react-native'
import React from 'react'

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
    return(
        <View className="flex-1 justify-center items-center">
            <TouchableOpacity
               onPress = {handlePress}
               activeOpacity={0.8}
               className={`import { CustomButton} from "../../components/Custom Button";
items-center justify-center px-2 py-2 rounded
               ${containerStyles} 
               ${isLoading ? 'opacity-50' : ''}`}
               disabled={isLoading}>
                <Text className = {`text-gray-500 font-plight text-lg ${textStyles}`}>{title}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default CustomButton