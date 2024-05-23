import {Alert, StyleSheet, Text, View} from 'react-native';
import FormField from "../components/FormField";
import CustomButton from "../components/Custom Button";
import {useState} from "react";

import * as SecureStore from "expo-secure-store";

const createUser = async(username, email, password) => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_URL}/user/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, email, password}),
    });
    if (!response.ok) {
        throw new Error("An error occurred while signing up");
    }
    return await response.json();
};


export default function App() {
    const [form, setForm] = useState({
        username: "", email: "", password: "",
    });
    const [isSubmitting, setSubmitting] = useState(false);
    const submit = async () => {
        if (form.username === "" || form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
        }
	    setSubmitting(true);
        try {
            const result = await createUser(form.username, form.email, form.password);
            let token = result.access_token;
            await SecureStore.setItemAsync("token", token);
            Alert.alert("Success", "You have successfully signed up");
            // Make an example get request
            const response = await fetch(`${process.env.EXPO_PUBLIC_URL}/example`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await SecureStore.getItemAsync("token")}`,
                },
            });
            Alert.alert("Success", (await response.json()).message);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    }

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
                handlePress={submit}
                isLoading={isSubmitting}
            />
        </View>
    )
}