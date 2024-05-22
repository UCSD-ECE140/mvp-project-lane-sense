import {StyleSheet, Text, View} from 'react-native';
import FormField from "../components/FormField";
import CustomButton from "../components/Custom Button";
import {useState} from "react";

export default function App() {
    const [form, setForm] = useState({
        username: "", email: "", password: "",
    });
    return (
        <View className="w-full flex justify-center h-full px-4">
            <Text className="text-2xl font-semibold text-black mt-10 font-psemibold">
                Sign Up
            </Text>

            <FormField
                title="Username"
                value={form.username}
                handleChangeText={(e) => setForm({...form, username: e})}
                otherStyles="mt-10"
            />

            <FormField
                title="Email"
                value={form.email}
                handleChangeText={(e) => setForm({...form, email: e})}
                otherStyles="mt-7"
                keyboardType="email-address"
            />

            <FormField
                title="Password"
                value={form.password}
                handleChangeText={(e) => setForm({...form, password: e})}
                otherStyles="mt-7"
            />

            <CustomButton
                title="Sign Up"
                containerStyles="bg-black"
            />
        </View>
    )
}