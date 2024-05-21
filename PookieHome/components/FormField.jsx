import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {useState} from 'react';

const FormField = ({title,
                   value, placeholder,
                   handleChangeText,
                   otherStyles,
                   keyboardType,
                   ...props}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-blue-800 font-pmedium">{title}</Text>

            <View
                className={"border-2 border-blue-800 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-blue-4      00"}>
                <TextInput
                    className="flex-1 text-blue-800 font-psemibold text-base"
                    value={value}
                    placeHolder={placeholder}
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPassword}
                    {...props}
                />

                {title === 'Password' && (
                    <TouchableOpacity onPress={()=>
                        setShowPassword(!showPassword)}>

                    </TouchableOpacity>)}
            </View>
        </View>

    )
}

export default FormField;